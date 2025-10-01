import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check authentication status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = () => {
        try {
            if (authService.isAuthenticated()) {
                const userData = authService.getUserData();
                setUser(userData);
                setIsAuthenticated(true);
            } else {
                // Clear any invalid stored data
                authService.logout();
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            authService.logout();
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        setLoading(true);
        try {
            const result = await authService.login(username, password);
            
            if (result.success) {
                setUser(result.user);
                setIsAuthenticated(true);
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setUser(null);
    };

    const refreshAuth = () => {
        checkAuthStatus();
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        refreshAuth,
        authService // Expose authService for direct API calls
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
