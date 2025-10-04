// Authentication service for JWT token management
import config from '../config/api';

class AuthService {
    constructor() {
        this.baseURL = config.baseURL;
        this.tokenKey = 'authToken';
        this.expiryKey = 'tokenExpiry';
        this.userKey = 'userData';
    }

    // Login with external API
    async login(username, password) {
        try {
            const response = await fetch(`${this.baseURL}${config.endpoints.auth.login}`, {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userName: username,
                    password: password
                }),
                mode: 'cors' // Explicitly set CORS mode
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Store token and user data
            this.setToken(data.accessToken, data.expiresAtUtc);
            this.setUserData({ username, role: 'admin' }); // Assuming admin role for now
            
            return {
                success: true,
                token: data.accessToken,
                expiresAt: data.expiresAtUtc,
                user: { username, role: 'admin' }
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message || 'Login failed. Please try again.'
            };
        }
    }

    // Set token and expiry in localStorage
    setToken(token, expiresAt) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.expiryKey, expiresAt);
    }

    // Set user data in localStorage
    setUserData(userData) {
        localStorage.setItem(this.userKey, JSON.stringify(userData));
    }

    // Get stored token
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Get stored user data
    getUserData() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    // Check if token is valid and not expired
    isTokenValid() {
        const token = this.getToken();
        const expiry = localStorage.getItem(this.expiryKey);
        
        if (!token || !expiry) {
            return false;
        }

        try {
            const expiryDate = new Date(expiry);
            const now = new Date();
            
            // Check if token is expired (with 5 minute buffer)
            const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
            return expiryDate.getTime() > (now.getTime() + bufferTime);
        } catch (error) {
            console.error('Error checking token validity:', error);
            return false;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.isTokenValid() && this.getUserData() !== null;
    }

    // Logout and clear stored data
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.expiryKey);
        localStorage.removeItem(this.userKey);
    }

    // Get authorization header for API calls
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // Make authenticated API call
    async makeAuthenticatedRequest(url, options = {}) {
        const token = this.getToken();
        
        if (!token) {
            throw new Error('No authentication token available');
        }

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers
            }
        };

        const response = await fetch(url, { ...defaultOptions, ...options });
        
        // If token is expired, clear auth data
        if (response.status === 401) {
            this.logout();
            throw new Error('Authentication expired. Please login again.');
        }

        return response;
    }

}

// Create singleton instance
const authService = new AuthService();
export default authService;
