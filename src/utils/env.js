// Environment configuration utility
export const getApiBaseUrl = () => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
        return import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5159/api';
    }

    // Fallback for server-side rendering or other environments
    return process.env.VITE_API_BASE_URL || 'http://localhost:5159/api';
};

export const getApiBaseUrlWithoutApi = () => {
    const baseUrl = getApiBaseUrl();
    return baseUrl.replace('/api', '');
};

export const isDevelopment = () => {
    return import.meta.env?.MODE === 'development' ||
        import.meta.env?.NODE_ENV === 'development';
};

export const isProduction = () => {
    return import.meta.env?.MODE === 'production' ||
        import.meta.env?.NODE_ENV === 'production';
};
