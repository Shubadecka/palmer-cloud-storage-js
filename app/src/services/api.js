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
        errorMessage = errorData.message || errorData.error || errorMessage
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
