/**
 * Tests for app/api/config.js
 * Tests API configuration and utility functions
 */

import {
    getBaseUrl,
    getCommonHeaders,
    apiRequest,
    binaryRequest,
    downloadFile,
    setBaseUrl,
    clearBaseUrlOverride,
    getConfigInfo
} from '../../api/config.js';

// Mock fetch globally
global.fetch = jest.fn();
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

// Mock DOM elements
const mockAnchor = {
    href: '',
    download: '',
    click: jest.fn()
};

document.createElement = jest.fn(() => mockAnchor);
document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock URL and URLSearchParams
const mockSearchParams = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
};

const mockUrl = {
    searchParams: mockSearchParams,
    searchParams: mockSearchParams
};

global.URL = jest.fn(() => mockUrl);
global.URLSearchParams = jest.fn(() => mockSearchParams);

// Mock window.location and history
Object.defineProperty(window, 'location', {
    value: {
        search: '',
        href: 'http://localhost:3000'
    },
    writable: true
});

Object.defineProperty(window, 'history', {
    value: {
        replaceState: jest.fn()
    },
    writable: true
});

describe('API Config Module', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Reset localStorage mock
        localStorageMock.getItem.mockReturnValue(null);
        localStorageMock.setItem.mockClear();
        localStorageMock.removeItem.mockClear();
        
        // Reset URL mocks
        mockSearchParams.get.mockReturnValue(null);
        mockSearchParams.set.mockClear();
        mockSearchParams.delete.mockClear();
        
        // Reset fetch mock
        fetch.mockClear();
        
        // Reset DOM mocks
        mockAnchor.click.mockClear();
        document.body.appendChild.mockClear();
        document.body.removeChild.mockClear();
        
        // Reset URL.createObjectURL mock
        global.URL.createObjectURL.mockReturnValue('blob:mock-url');
        global.URL.revokeObjectURL.mockClear();
    });

    describe('getBaseUrl()', () => {
        test('should return default URL with root path when no overrides', () => {
            const result = getBaseUrl();
            expect(result).toBe('http://localhost:1442/palmer_server');
        });

        test('should use localStorage override when available', () => {
            localStorageMock.getItem.mockReturnValue('http://custom-api:8080');
            
            const result = getBaseUrl();
            expect(result).toBe('http://custom-api:8080/palmer_server');
        });

        test('should use query parameter override when available', () => {
            mockSearchParams.get.mockReturnValue('http://query-api:9000');
            
            const result = getBaseUrl();
            expect(result).toBe('http://query-api:9000/palmer_server');
        });

        test('should prioritize query parameter over localStorage', () => {
            localStorageMock.getItem.mockReturnValue('http://local-api:8080');
            mockSearchParams.get.mockReturnValue('http://query-api:9000');
            
            const result = getBaseUrl();
            expect(result).toBe('http://query-api:9000/palmer_server');
        });

        test('should not add root path if already present', () => {
            localStorageMock.getItem.mockReturnValue('http://api:8080/palmer_server');
            
            const result = getBaseUrl();
            expect(result).toBe('http://api:8080/palmer_server');
        });

        test('should handle URLs with trailing slashes', () => {
            localStorageMock.getItem.mockReturnValue('http://api:8080/');
            
            const result = getBaseUrl();
            expect(result).toBe('http://api:8080/palmer_server');
        });
    });

    describe('getCommonHeaders()', () => {
        test('should return default headers when no additional headers provided', () => {
            const headers = getCommonHeaders();
            
            expect(headers).toEqual({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            });
        });

        test('should merge additional headers with defaults', () => {
            const additionalHeaders = {
                'Authorization': 'Bearer token123',
                'X-Custom-Header': 'custom-value'
            };
            
            const headers = getCommonHeaders(additionalHeaders);
            
            expect(headers).toEqual({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer token123',
                'X-Custom-Header': 'custom-value'
            });
        });

        test('should override default headers when provided in additional headers', () => {
            const additionalHeaders = {
                'Content-Type': 'application/xml',
                'Accept': 'text/plain'
            };
            
            const headers = getCommonHeaders(additionalHeaders);
            
            expect(headers).toEqual({
                'Content-Type': 'application/xml',
                'Accept': 'text/plain'
            });
        });
    });

    describe('apiRequest()', () => {
        test('should make successful JSON request', async () => {
            const mockResponse = { success: true, data: 'test' };
            const mockResponseText = JSON.stringify(mockResponse);
            
            fetch.mockResolvedValueOnce({
                ok: true,
                text: jest.fn().mockResolvedValue(mockResponseText)
            });
            
            const result = await apiRequest('/test-endpoint');
            
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:1442/palmer_server/test-endpoint',
                expect.objectContaining({
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                })
            );
            expect(result).toEqual(mockResponse);
        });

        test('should handle empty response', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                text: jest.fn().mockResolvedValue('')
            });
            
            const result = await apiRequest('/empty-endpoint');
            
            expect(result).toBeNull();
        });

        test('should handle HTTP error with JSON error response', async () => {
            const errorResponse = { detail: 'Validation failed' };
            const errorText = JSON.stringify(errorResponse);
            
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                text: jest.fn().mockResolvedValue(errorText)
            });
            
            await expect(apiRequest('/error-endpoint')).rejects.toThrow('Validation failed');
        });

        test('should handle HTTP error with plain text response', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: jest.fn().mockResolvedValue('Server error message')
            });
            
            await expect(apiRequest('/error-endpoint')).rejects.toThrow('Server error message');
        });

        test('should handle malformed JSON response', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                text: jest.fn().mockResolvedValue('invalid json')
            });
            
            await expect(apiRequest('/malformed-endpoint')).rejects.toThrow('Failed to parse JSON response');
        });

        test('should pass through custom options', async () => {
            const mockResponse = { success: true };
            fetch.mockResolvedValueOnce({
                ok: true,
                text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse))
            });
            
            const options = {
                method: 'POST',
                body: JSON.stringify({ test: 'data' }),
                headers: { 'X-Custom': 'value' }
            };
            
            await apiRequest('/test-endpoint', options);
            
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:1442/palmer_server/test-endpoint',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ test: 'data' }),
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Custom': 'value'
                    }
                })
            );
        });
    });

    describe('binaryRequest()', () => {
        test('should make successful binary request', async () => {
            const mockBlob = new Blob(['test data'], { type: 'application/octet-stream' });
            
            fetch.mockResolvedValueOnce({
                ok: true,
                blob: jest.fn().mockResolvedValue(mockBlob)
            });
            
            const result = await binaryRequest('/download/file.txt');
            
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:1442/palmer_server/download/file.txt',
                expect.objectContaining({
                    headers: {
                        'Accept': '*/*'
                    }
                })
            );
            expect(result).toBe(mockBlob);
        });

        test('should handle binary request error', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                text: jest.fn().mockResolvedValue('File not found')
            });
            
            await expect(binaryRequest('/download/missing.txt')).rejects.toThrow('File not found');
        });

        test('should pass through custom headers for binary requests', async () => {
            const mockBlob = new Blob(['test data']);
            fetch.mockResolvedValueOnce({
                ok: true,
                blob: jest.fn().mockResolvedValue(mockBlob)
            });
            
            const options = {
                headers: { 'Authorization': 'Bearer token' }
            };
            
            await binaryRequest('/download/file.txt', options);
            
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:1442/palmer_server/download/file.txt',
                expect.objectContaining({
                    headers: {
                        'Accept': '*/*',
                        'Authorization': 'Bearer token'
                    }
                })
            );
        });
    });

    describe('downloadFile()', () => {
        test('should create download link and trigger download', () => {
            const mockBlob = new Blob(['test data'], { type: 'text/plain' });
            const filename = 'test.txt';
            
            downloadFile(mockBlob, filename);
            
            expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
            expect(document.createElement).toHaveBeenCalledWith('a');
            expect(mockAnchor.href).toBe('blob:mock-url');
            expect(mockAnchor.download).toBe(filename);
            expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor);
            expect(mockAnchor.click).toHaveBeenCalled();
            expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchor);
            expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
        });
    });

    describe('setBaseUrl()', () => {
        test('should persist URL in localStorage when persist is true', () => {
            const newBaseUrl = 'http://new-api:8080';
            
            setBaseUrl(newBaseUrl, true);
            
            expect(localStorageMock.setItem).toHaveBeenCalledWith('api_base_url', newBaseUrl);
            expect(mockSearchParams.set).not.toHaveBeenCalled();
        });

        test('should set URL parameter when persist is false', () => {
            const newBaseUrl = 'http://new-api:8080';
            
            setBaseUrl(newBaseUrl, false);
            
            expect(localStorageMock.setItem).not.toHaveBeenCalled();
            expect(mockSearchParams.set).toHaveBeenCalledWith('api_base_url', newBaseUrl);
            expect(window.history.replaceState).toHaveBeenCalled();
        });

        test('should default to not persisting', () => {
            const newBaseUrl = 'http://new-api:8080';
            
            setBaseUrl(newBaseUrl);
            
            expect(localStorageMock.setItem).not.toHaveBeenCalled();
            expect(mockSearchParams.set).toHaveBeenCalledWith('api_base_url', newBaseUrl);
        });
    });

    describe('clearBaseUrlOverride()', () => {
        test('should clear localStorage and URL parameter', () => {
            clearBaseUrlOverride();
            
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('api_base_url');
            expect(mockSearchParams.delete).toHaveBeenCalledWith('api_base_url');
            expect(window.history.replaceState).toHaveBeenCalled();
        });
    });

    describe('getConfigInfo()', () => {
        test('should return configuration information with no overrides', () => {
            const info = getConfigInfo();
            
            expect(info).toEqual({
                baseUrl: 'http://localhost:1442/palmer_server',
                defaultBaseUrl: 'http://localhost:1442',
                rootPath: '/palmer_server',
                hasOverride: false
            });
        });

        test('should return configuration information with localStorage override', () => {
            localStorageMock.getItem.mockReturnValue('http://custom-api:8080');
            
            const info = getConfigInfo();
            
            expect(info).toEqual({
                baseUrl: 'http://custom-api:8080/palmer_server',
                defaultBaseUrl: 'http://localhost:1442',
                rootPath: '/palmer_server',
                hasOverride: true
            });
        });

        test('should return configuration information with query parameter override', () => {
            mockSearchParams.get.mockReturnValue('http://query-api:9000');
            
            const info = getConfigInfo();
            
            expect(info).toEqual({
                baseUrl: 'http://query-api:9000/palmer_server',
                defaultBaseUrl: 'http://localhost:1442',
                rootPath: '/palmer_server',
                hasOverride: true
            });
        });
    });

    describe('Integration scenarios', () => {
        test('should handle complete API request flow with custom base URL', async () => {
            // Set custom base URL
            localStorageMock.getItem.mockReturnValue('http://custom-api:8080');
            
            // Mock successful response
            const mockResponse = { success: true, message: 'Test response' };
            fetch.mockResolvedValueOnce({
                ok: true,
                text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse))
            });
            
            // Make API request
            const result = await apiRequest('/test');
            
            // Verify correct URL was used
            expect(fetch).toHaveBeenCalledWith(
                'http://custom-api:8080/palmer_server/test',
                expect.any(Object)
            );
            expect(result).toEqual(mockResponse);
        });

        test('should handle error recovery and retry scenario', async () => {
            // First request fails
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: jest.fn().mockResolvedValue('Server temporarily unavailable')
            });
            
            // Second request succeeds
            const mockResponse = { success: true, retry: true };
            fetch.mockResolvedValueOnce({
                ok: true,
                text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse))
            });
            
            // First attempt should fail
            await expect(apiRequest('/test')).rejects.toThrow('Server temporarily unavailable');
            
            // Second attempt should succeed
            const result = await apiRequest('/test');
            expect(result).toEqual(mockResponse);
        });
    });
}); 