### High-level target architecture
- **API layer (`/api`)**: thin wrappers around `pcs-api` endpoints (`/login`, `/files`, `/admin`, `/llm`) with centralized base URL, request helpers, and typed response handling.
- **Interface layer (`/interface`)**: page controllers, global state, navigation, and reusable UI helpers (spinners, toasts, form handling).
- **Pages (`/pages`)**: static HTML shells for Login, 2FA, File Storage, LLM, Admin Tools. Minimal markup that imports the relevant interface controller.

### Step-by-step plan

#### Phase 0 — Alignment and inventory
1. **Confirm feature scope to migrate now**
   - **Login + 2FA flow** (password, device remember, code verification).
   - **File browser**: list, navigate, upload, download file/dir (zip), create directories (share at root), delete file/dir (move-to-deleted).
   - **Admin tools**: create/update user, disable user, view user info, manage directory access.
   - **LLM chat**: conversation history with chosen model calling `/llm/response`.
   - Defer non-API-backed Streamlit bits (e.g., `saved_ids.csv` ban logic) or flag for future API support.

2. **Decide API base URL and root path**
   - Use `http://localhost:1442/palmer_server` during development per `pcs-api/main.py`.
   - Externalize to one place in `api/config.js`. Support override via query param or localStorage if needed.

#### Phase 1 — API layer scaffolding (`/api`)
3. Create `app/api/config.js`
   - `getBaseUrl()` returning base URL with `/palmer_server` root.
   - Common headers, JSON helpers, and binary download helpers.

4. Create `app/api/auth.js`
   - `login(username, password, deviceId)` → GET `/login?username=&password=&device_identifier=`
     - Returns `{ is_correct_password, is_admin, is_device_remembered, message }`.
   - `verifyTwoFactor(username, code)` → GET `/login/two-factor-auth?username=&validation_code=`
     - Returns `{ is_valid, message }`.

5. Create `app/api/files.js`
   - `listFiles(path)` → GET `/files/list-files?path=`
   - `uploadFile(directory, File)` → PUT multipart `/files/upload-file`
   - `createDirectory(path, currentUser, sharedWith[])` → PUT JSON `/files/create-directory`
   - `downloadFile(path)` → GET `/files/download-file?path=` (returns bytes)
   - `downloadDirectory(path)` → GET `/files/download-directory?path=` (returns zip bytes)
   - `deleteFile(path)` → DELETE `/files/file?path=`
   - `deleteDirectory(path)` → DELETE `/files/directory?path=`

6. Create `app/api/admin.js`
   - `getUser(actionUser, targetUser)` → GET `/admin/user?action_user=&target_user=`
   - `postUser(request)` → POST `/admin/user` (body: `PostUserRequest`)
   - `deleteUser(actionUser, targetUser)` → DELETE `/admin/user` (body: `DeleteUserRequest`)

7. Create `app/api/llm.js`
   - `getLLMResponse({ userId, conversation, model })` → POST `/llm/response`

#### Phase 2 — Interface utilities (`/interface`)
8. Create `app/interface/state.js`
   - Global app state with:
     - `currentUser` (username), `isAdmin`, `deviceId` (persist in `localStorage`), `rememberDevice` flag.
     - `currentPath` for file browser.
     - `conversation` for LLM history and selected `model`.
   - Helpers: `loadState()`, `saveState()`, `ensureDeviceId()` (UUID), `resetOnLogout()`.

9. Create `app/interface/navigation.js`
   - Functions to navigate between pages: `goToLogin()`, `goTo2FA()`, `goToMainMenu()`, `goToFileStorage()`, `goToLLM()`, `goToAdminTools()`.
   - Implement via `window.location.href` to files in `/pages`.

10. Create `app/interface/ui.js`
    - Reusable UI helpers: show/hide loading spinner, toast notifications, confirm dialogs, file download helper that turns bytes into Blob and triggers download.

11. Create `app/interface/validators.js`
    - Input validators for usernames, emails, safe path concatenation, and optional simple throttling for login attempts (UI-only).

#### Phase 3 — Page controllers (`/interface`)
12. Login page controller: `app/interface/login.js`
    - On load: `ensureDeviceId()`.
    - On submit:
      - Call `auth.login(username, password, deviceId)`.
      - If `!is_correct_password` → show error and increment attempt counter.
      - If `is_device_remembered` → persist user state and `goToMainMenu()`.
      - Else → persist username, `goTo2FA()`.

13. Two-factor page controller: `app/interface/twofactor.js`
    - Fields: code input, optional “Remember this device” checkbox.
    - On submit:
      - Call `auth.verifyTwoFactor(username, code)`.
      - If valid: persist `rememberDevice=true`, set `isAdmin` from login response cached state (or perform a light `/admin/user` probe as needed), `goToMainMenu()`.

14. Main menu controller: `app/interface/main.js`
    - Renders buttons to File Storage, LLM, Admin Tools (conditionally visible if `isAdmin`).
    - Logout button: `resetOnLogout()` and `goToLogin()`.

15. File storage controller: `app/interface/fileStorage.js`
    - State: `currentPath` default to base root or user root (the server enforces safety).
    - On load:
      - Call `files.listFiles(currentPath)`; render directories and files.
      - “Up one level” logic by trimming the last segment unless at root.
    - For each directory:
      - Open: update `currentPath` and rerender.
      - Download: call `downloadDirectory` and save zip.
      - Delete: confirm then call `deleteDirectory` and refresh.
    - For files:
      - Download: call `downloadFile`.
      - Delete: confirm then call `deleteFile`.
    - Upload section:
      - Multiple file selection; iterate `uploadFile(currentPath, file)`.
      - Show progress and refresh on completion.
    - Create directory:
      - If `currentPath` is root:
        - Step 1: collect directory name.
        - Step 2: multiselect users to share with.
        - Call `createDirectory(path=<root/new>, currentUser, sharedWith)`.
      - Else:
        - Create immediately via `createDirectory(path=<current/new>, currentUser, [])`.

16. Admin tools controller: `app/interface/adminTools.js`
    - Load target user by username (typed).
    - Show user info: directories, is_admin, is_disabled.
    - Create/update user:
      - Form: username, password (optional for update), email, is_admin, add/remove directories (chips/multiselect).
      - On submit: build `PostUserRequest` and call `admin.postUser`.
    - Disable user:
      - Submit `deleteUser(actionUser, targetUser)` with confirmation.
    - UX: reflect updated directories after changes.

17. LLM controller: `app/interface/llm.js`
    - Model select from a fixed list (e.g., as in the Streamlit app).
    - Conversation history rendering.
    - On submit: append user message, call `getLLMResponse({ userId, conversation, model })`, append assistant response.

#### Phase 4 — Pages (`/pages`)
18. Add/update HTML shells to import their controllers:
   - `pages/index.html` → includes `interface/login.js`.
   - `pages/twofactor.html` → includes `interface/twofactor.js`.
   - `pages/file-storage.html` → includes `interface/fileStorage.js`.
   - `pages/llm.html` → includes `interface/llm.js`.
   - `pages/admin-tools.html` → includes `interface/adminTools.js`.
   - Keep your existing structure and styles; add minimal placeholders (form/container divs) the controllers target.

19. Update the current `app/index.html` if needed:
   - Keep as login page; ensure it loads `interface/login.js` not `script.js`.
   - Use consistent styles already in `styles.css`.

#### Phase 5 — Cross-cutting behavior
20. Error handling
   - Centralize fetch error parsing in `api/config.js`.
   - Show human-readable messages via `ui.toast`.

21. Security/validation
   - Never build unsafe paths on client; send requested `path` and let server sanitize.
   - Validate inputs client-side: no empty usernames, valid emails, directory names without slashes.

22. Device remember logic
   - Persist `deviceId` in `localStorage`.
   - Respect `is_device_remembered` to skip 2FA.
   - When 2FA succeeds and “remember device” checked, just keep same deviceId for future logins.

23. Downloads
   - Use `Blob` and `URL.createObjectURL` to save files/zip.
   - For large files, show a spinner.

24. State persistence
   - Persist `currentUser`, `isAdmin`, `model`, and last `currentPath` in `localStorage`.
   - Clear on logout.

#### Phase 6 — Mapping to `pcs-api`
25. Endpoint mapping (illustrative)
   - Auth:
     - `GET {base}/login?username=&password=&device_identifier=`
     - `GET {base}/login/two-factor-auth?username=&validation_code=`
   - Files:
     - `GET {base}/files/list-files?path=`
     - `PUT {base}/files/upload-file` (FormData: `directory`, `file`)
     - `PUT {base}/files/create-directory` (JSON: `path`, `current_user`, `shared_with`)
     - `GET {base}/files/download-file?path=`
     - `GET {base}/files/download-directory?path=`
     - `DELETE {base}/files/file?path=`
     - `DELETE {base}/files/directory?path=`
   - Admin:
     - `GET {base}/admin/user?action_user=&target_user=`
     - `POST {base}/admin/user` (JSON `PostUserRequest`)
     - `DELETE {base}/admin/user` (JSON `DeleteUserRequest`)
   - LLM:
     - `POST {base}/llm/response` (JSON `LLMResponseRequest`)

#### Phase 7 — Progressive implementation and testing
26. Implement in the following order:
   - Config + API helpers → Login + 2FA → Main menu → File browser (list, nav) → Upload/Download → Create/Delete → Sharing at root → Admin tools → LLM.

27. Manual test cases
   - Login with wrong pass (error), correct pass (requires 2FA), remembered device (skip 2FA).
   - File browser at root vs nested; disallow navigating outside root (server enforces).
   - Upload duplicate filename (expect 409).
   - Create shared dir at root with multiple users; verify via `getUser`.
   - Disable user: verify login fails.
   - LLM: long conversation; model switching.

28. Performance/UX passes
   - Debounce API calls where appropriate.
   - Keep last path per user.
   - Add loading indicators per action.

#### Phase 8 — Future enhancements (optional)
29. Replace GET-with-credentials with token-based auth once `pcs-api` supports sessions/JWT.
30. Add streaming LLM responses if a streaming endpoint is exposed.
31. If needed, add Story Bible page once endpoints exist.

### Deliverables created by this plan (no code yet)
- `app/api/`:
  - `config.js`, `auth.js`, `files.js`, `admin.js`, `llm.js`
- `app/interface/`:
  - `state.js`, `navigation.js`, `ui.js`, `validators.js`
  - `login.js`, `twofactor.js`, `main.js`, `fileStorage.js`, `adminTools.js`, `llm.js`
- `app/pages/`:
  - Ensure `index.html`, add `twofactor.html`; keep `file-storage.html`, `llm.html`, `admin-tools.html`

Short callouts
- Base URL must include the FastAPI `root_path` `/palmer_server`.
- Server enforces path safety; client must not attempt to bypass.
- Admin actions always include `action_user` as the logged-in username. 