// API service for making authenticated requests
import authService from './authService';
import config from '../config/api';

class ApiService {
    constructor() {
        this.baseURL = config.baseURL;
    }

    // Generic method to make authenticated API calls
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeader(),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            // Handle token expiration
            if (response.status === 401) {
                authService.logout();
                // You might want to redirect to login page here
                window.location.reload(); // Simple reload for now
                throw new Error('Authentication expired. Please login again.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    // POST request
    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    // PATCH request
    async patch(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    // Upload file with authentication
    async uploadFile(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Add additional data
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        const url = `${this.baseURL}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                ...authService.getAuthHeader()
                // Don't set Content-Type for FormData, let browser set it
            },
            body: formData
        });

        if (response.status === 401) {
            authService.logout();
            window.location.reload();
            throw new Error('Authentication expired. Please login again.');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }
}

// Create singleton instance
const apiService = new ApiService();
export default apiService;
