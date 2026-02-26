# Step 10: API Service

Create the API service layer with all the functions needed to communicate with the backend.

## Concepts

- **API Base URL**: Configuring where requests are sent
- **Fetch API**: Making HTTP requests
- **Error Handling**: Consistent error handling across all calls
- **Request Helpers**: Reusable functions for common patterns

## Tasks

### 10.1 Create the API Service File

Create `src/services/api.js`:

This file will contain all API call functions. Start with the base configuration.

```jsx
// API base URL - adjust for your local setup
const API_BASE = 'http://localhost:3001/api'
// Or if using Vite proxy: const API_BASE = '/api'

/**
 * Helper function for making API requests
 * Handles common patterns: JSON parsing, error handling, auth headers
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  
  const config = {
    ...options,
    headers: {
      ...options.headers,
    },
  }
  
  // Add JSON content-type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  
  // Include credentials for session-based auth
  config.credentials = 'include'
  
  const response = await fetch(url, config)
  
  // Handle non-OK responses
  if (!response.ok) {
    let errorMessage = 'Request failed'
    
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch {
      // Response wasn't JSON, use status text
      errorMessage = response.statusText || errorMessage
    }
    
    throw new Error(errorMessage)
  }
  
  // Return null for 204 No Content
  if (response.status === 204) {
    return null
  }
  
  return response.json()
}
```

### 10.2 Add Authentication API Functions

```jsx
// ============================================
// AUTHENTICATION APIs
// ============================================

/**
 * Log in with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{user: object}>}
 */
export async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

/**
 * Register a new account
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{user: object}>}
 */
export async function register(email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

/**
 * Log out the current user
 * @returns {Promise<null>}
 */
export async function logout() {
  return request('/auth/logout', {
    method: 'POST',
  })
}

/**
 * Get the current logged-in user
 * @returns {Promise<{user: object}>}
 */
export async function getCurrentUser() {
  return request('/auth/me')
}
```

### 10.3 Add Entry API Functions

```jsx
// ============================================
// ENTRY APIs
// ============================================

/**
 * Get all entries with optional filtering
 * @param {object} options - Filter options
 * @param {string} options.startDate - Filter by start date
 * @param {string} options.endDate - Filter by end date
 * @param {number} options.page - Page number for pagination
 * @param {number} options.limit - Items per page
 * @returns {Promise<{entries: array, total: number}>}
 */
export async function getEntries(options = {}) {
  const params = new URLSearchParams()
  
  if (options.startDate) params.append('startDate', options.startDate)
  if (options.endDate) params.append('endDate', options.endDate)
  if (options.page) params.append('page', options.page)
  if (options.limit) params.append('limit', options.limit)
  
  const queryString = params.toString()
  const endpoint = queryString ? `/entries?${queryString}` : '/entries'
  
  return request(endpoint)
}

/**
 * Get a single entry by ID
 * @param {number|string} id 
 * @returns {Promise<{entry: object}>}
 */
export async function getEntry(id) {
  return request(`/entries/${id}`)
}

/**
 * Update an entry
 * @param {number|string} id 
 * @param {object} data - Fields to update
 * @param {string} data.date - New date
 * @param {string} data.transcription - Updated transcription
 * @returns {Promise<{entry: object}>}
 */
export async function updateEntry(id, data) {
  return request(`/entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete an entry
 * @param {number|string} id 
 * @returns {Promise<null>}
 */
export async function deleteEntry(id) {
  return request(`/entries/${id}`, {
    method: 'DELETE',
  })
}
```

### 10.4 Add Page API Functions

```jsx
// ============================================
// PAGE APIs (Journal Images)
// ============================================

/**
 * Get a page by ID (returns image URL/data)
 * @param {number|string} id 
 * @returns {Promise<{page: object}>}
 */
export async function getPage(id) {
  return request(`/pages/${id}`)
}

/**
 * Upload a new journal page image
 * @param {FormData} formData - Must include 'image' file and 'date' string
 * @returns {Promise<{page: object}>}
 */
export async function uploadPage(formData) {
  return request('/pages', {
    method: 'POST',
    body: formData,
    // Note: Don't set Content-Type header for FormData
    // The browser will set it automatically with the boundary
  })
}

/**
 * Delete a page and all its entries
 * @param {number|string} id 
 * @returns {Promise<null>}
 */
export async function deletePage(id) {
  return request(`/pages/${id}`, {
    method: 'DELETE',
  })
}
```

### 10.5 Optional: Configure Vite Proxy

If you want to use relative URLs (like `/api` instead of `http://localhost:3001/api`), configure a proxy in `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

Then update the API_BASE:
```js
const API_BASE = '/api'
```

This proxies all `/api/*` requests to your local backend during development.

### 10.6 Integrate with AuthContext

Now update `src/context/AuthContext.jsx` to use the real API functions:

```jsx
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser } from '../services/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Check session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const data = await getCurrentUser()
        setUser(data.user)
      } catch {
        // Not logged in or session expired
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [])
  
  const login = async (email, password) => {
    const data = await apiLogin(email, password)
    setUser(data.user)
  }
  
  const register = async (email, password) => {
    const data = await apiRegister(email, password)
    setUser(data.user)
  }
  
  const logout = async () => {
    await apiLogout()
    setUser(null)
  }
  
  // ... rest of the provider
}
```

### 10.7 Update Components to Use Real API

Go back through your components and replace mock data with real API calls:

**DashboardPage.jsx:**
```jsx
import { getEntries } from '../services/api'

// In useEffect:
const data = await getEntries()
setEntries(data.entries)
```

**EntryDetailPage.jsx:**
```jsx
import { getEntry, deleteEntry } from '../services/api'

// Fetch entry:
const data = await getEntry(id)
setEntry(data.entry)

// Delete:
await deleteEntry(id)
```

**UploadPage.jsx:**
```jsx
import { uploadPage } from '../services/api'

// Submit:
await uploadPage(formData)
```

**PageImageViewer.jsx:**
```jsx
import { getPage } from '../services/api'

// Fetch:
const data = await getPage(pageId)
setImageUrl(data.page.imageUrl)
```

## API Response Formats

Expected response formats for each endpoint:

### Auth Endpoints
```js
// POST /api/auth/login, /api/auth/register
{ user: { id, email, createdAt } }

// GET /api/auth/me
{ user: { id, email, createdAt } }

// POST /api/auth/logout
// 204 No Content
```

### Entry Endpoints
```js
// GET /api/entries
{ entries: [...], total: number }

// GET /api/entries/:id
{ entry: { id, date, transcription, status, page_id } }

// PUT /api/entries/:id
{ entry: { id, date, transcription, status, page_id } }

// DELETE /api/entries/:id
// 204 No Content
```

### Page Endpoints
```js
// GET /api/pages/:id
{ page: { id, imageUrl, date, createdAt } }

// POST /api/pages
{ page: { id, imageUrl, date, createdAt } }

// DELETE /api/pages/:id
// 204 No Content
```

## Checkpoint

At this point you should have:
- [ ] API service file with all functions
- [ ] Helper function for common request patterns
- [ ] Authentication functions (login, register, logout, getCurrentUser)
- [ ] Entry functions (getEntries, getEntry, updateEntry, deleteEntry)
- [ ] Page functions (getPage, uploadPage, deletePage)
- [ ] AuthContext updated to use real API
- [ ] Components using real API calls (or ready to switch)

## You're Done!

Congratulations! You've built the complete frontend structure for the Journal Transcription app. The app now has:

- User authentication (login/register/logout)
- Protected routes
- A dashboard showing all journal entries
- Upload functionality for new journal pages
- Entry detail view with lazy-loaded images
- API service layer ready for backend integration

### Next Steps

1. Build the backend API to handle these endpoints
2. Set up the database schema for users, pages, and entries
3. Implement the transcription logic
4. Add image storage (filesystem or cloud)
5. Deploy!
