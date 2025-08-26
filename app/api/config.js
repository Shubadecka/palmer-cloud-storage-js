/**
 * API Configuration and utility functions
 * Centralized configuration for the Palmer Cloud Storage API
 */

// Default API configuration
const DEFAULT_BASE_URL = 'http://localhost:1442';
const DEFAULT_ROOT_PATH = '/palmer_server';

/**
 * Get the base URL for API requests
 * Supports override via query parameter or localStorage
 * @returns {string} The complete base URL including root path
 */
export function getBaseUrl() {
    // Check for override in URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const queryOverride = urlParams.get('api_base_url');
    
    // Check for override in localStorage
    const localStorageOverride = localStorage.getItem('api_base_url');
    
    // Use override if provided, otherwise use default
    const baseUrl = queryOverride || localStorageOverride || DEFAULT_BASE_URL;
    
    // Ensure the URL ends with the root path
    return baseUrl.endsWith(DEFAULT_ROOT_PATH) 
        ? baseUrl 
        : `${baseUrl}${DEFAULT_ROOT_PATH}`;
}

/**
 * Get common headers for API requests
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} Headers object for fetch requests
 */
export function getCommonHeaders(additionalHeaders = {}) {
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...additionalHeaders
    };
}

/**
 * Make a JSON API request
 * @param {string} endpoint - The API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Parsed JSON response
 */
export async function apiRequest(endpoint, options = {}) {
    const url = `${getBaseUrl()}${endpoint}`;
    const headers = getCommonHeaders(options.headers);
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch {
            errorData = { detail: errorText };
        }
        
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Handle empty responses
    const text = await response.text();
    if (!text) {
        return null;
    }
    
    try {
        return JSON.parse(text);
    } catch (error) {
        throw new Error(`Failed to parse JSON response: ${error.message}`);
    }
}

/**
 * Make a binary API request (for file downloads)
 * @param {string} endpoint - The API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Blob>} Binary response as Blob
 */
export async function binaryRequest(endpoint, options = {}) {
    const url = `${getBaseUrl()}${endpoint}`;
    const headers = {
        'Accept': '*/*',
        ...options.headers
    };
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch {
            errorData = { detail: errorText };
        }
        
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.blob();
}

/**
 * Download a file from binary response
 * @param {Blob} blob - The file blob
 * @param {string} filename - The filename to save as
 */
export function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Set API base URL override
 * @param {string} baseUrl - The new base URL
 * @param {boolean} persist - Whether to persist in localStorage
 */
export function setBaseUrl(baseUrl, persist = false) {
    if (persist) {
        localStorage.setItem('api_base_url', baseUrl);
    } else {
        // Update URL without page reload
        const url = new URL(window.location);
        url.searchParams.set('api_base_url', baseUrl);
        window.history.replaceState({}, '', url);
    }
}

/**
 * Clear API base URL override
 */
export function clearBaseUrlOverride() {
    localStorage.removeItem('api_base_url');
    
    // Clear from URL
    const url = new URL(window.location);
    url.searchParams.delete('api_base_url');
    window.history.replaceState({}, '', url);
}

/**
 * Get current API configuration info
 * @returns {Object} Configuration information
 */
export function getConfigInfo() {
    return {
        baseUrl: getBaseUrl(),
        defaultBaseUrl: DEFAULT_BASE_URL,
        rootPath: DEFAULT_ROOT_PATH,
        hasOverride: !!localStorage.getItem('api_base_url') || !!new URLSearchParams(window.location.search).get('api_base_url')
    };
} 