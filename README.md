# palmer-cloud-storage-js

React frontend for a personal journal transcription and information retrieval app. I have always wanted my journals to be searchable and discussable with a LLM, this will eventually do all that. Upload images of handwritten journal pages, browse transcribed entries by date, and manage your journal archive.
Requires the [backend](https://github.com/Shubadecka/pcs-api) and an OCR model on ollama to be running at the same time.

## Tech Stack

- **Framework:** React 18 + Vite
- **Routing:** React Router DOM 6
- **Styling:** Tailwind CSS
- **Utilities:** date-fns
- **Backend:** [pcs-api](../pcs-api) (FastAPI)

## Getting Started

### Prerequisites

- Node.js 18+
- [pcs-api](../pcs-api) running on `localhost:1442`

### Installation

```bash
cd app
npm install
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:5173`. API requests to `/api/*` are proxied to `http://localhost:1442` via Vite's dev server proxy.

### Production build

```bash
npm run build
npm run preview
```

## Routes

| Path | Description |
|---|---|
| `/login` | Login page |
| `/register` | Registration page |
| `/` | Dashboard — all journal entries with date filtering |
| `/pages` | Grid view of uploaded journal pages |
| `/upload` | Upload a new journal page image |
| `/entries/:id` | Individual entry detail view |

All routes except `/login` and `/register` require authentication.

## Project Structure

```
palmer-cloud-storage-js/
├── app/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/        # ProtectedRoute
│   │   │   ├── entries/     # EntryCard, EntryDetail, EntryList
│   │   │   ├── layout/      # Header, Layout, Navbar
│   │   │   ├── pages/       # ImagePreview, PageImageViewer, PageUpload
│   │   │   └── ui/          # Button, Input, LoadingSpinner, Modal
│   │   ├── context/         # AuthContext — global auth state
│   │   ├── hooks/           # useAuth
│   │   ├── pages/           # Page-level route components
│   │   ├── services/        # api.js — centralized fetch wrapper
│   │   ├── App.jsx          # Root component + routing
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
└── README.md
```

## Authentication

Auth state is managed globally via `AuthContext`. On app load, a `GET /api/auth/me` request checks for an active session. Login and registration set an httpOnly cookie (managed by the backend); all API requests include `credentials: 'include'` so the cookie is sent automatically. Protected routes redirect unauthenticated users to `/login`.

## API Connection

In development, Vite proxies `/api/*` to `http://localhost:1442`, so no CORS configuration is needed. All API calls go through `app/src/services/api.js`, which handles request formatting and parses FastAPI error responses.
