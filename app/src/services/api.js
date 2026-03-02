// API base URL - uses Vite proxy in development
const API_BASE = '/api'

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

  try {
    const response = await fetch(url, config)

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = 'Request failed'

      try {
        const errorData = await response.json()
        // FastAPI wraps errors as { detail: { message: '...' } } or { detail: '...' }
        errorMessage =
          errorData.detail?.message ||
          (typeof errorData.detail === 'string' ? errorData.detail : null) ||
          errorData.message ||
          errorData.error ||
          errorMessage
      } catch {
        // Response wasn't JSON, use status text
        errorMessage = response.statusText || errorMessage
      }

      const error = new Error(errorMessage)
      error.status = response.status
      throw error
    }

    // Return null for 204 No Content
    if (response.status === 204) {
      return null
    }

    return response.json()
  } catch (err) {
    // Re-throw with more context if it's a network error
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection.')
    }
    throw err
  }
}

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
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{user: object}>}
 */
export async function register(email, username, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password }),
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

// ============================================
// ENTRY APIs (Transcriptions)
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

// ============================================
// PAGE APIs (Journal Images)
// ============================================

/**
 * Get all pages with optional written-date filtering
 * @param {object} options - Filter options
 * @param {string} options.startDate - Filter by written date range start (YYYY-MM-DD)
 * @param {string} options.endDate - Filter by written date range end (YYYY-MM-DD)
 * @returns {Promise<{pages: array, total: number}>}
 */
export async function getPages({ startDate, endDate } = {}) {
  const params = new URLSearchParams()
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)
  const qs = params.toString()
  return request(qs ? `/pages?${qs}` : '/pages')
}

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
 * Run OCR and transcription processing on a page
 * @param {number|string} id
 * @returns {Promise<{page: object, entries: array}>}
 */
export async function processPage(id) {
  return request(`/pages/${id}/process`, {
    method: 'POST',
  })
}

/**
 * Update a page's start date
 * @param {number|string} id
 * @param {object} data - Fields to update
 * @param {string|null} data.page_start_date - New start date (YYYY-MM-DD), or null to clear
 * @returns {Promise<{page: object}>}
 */
export async function updatePage(id, data) {
  return request(`/pages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
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
