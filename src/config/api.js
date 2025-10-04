// API configuration
const config = {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://wheelsnow-api.onrender.com',
    endpoints: {
        auth: {
            login: '/api/admin/OffersManagement/login'
        },
        offers: {
            list: '/offers',
            create: '/offers',
            update: '/offers',
            delete: '/offers'
        }
    },
    timeout: 30000, // 30 seconds
    retryAttempts: 3
};

export default config;
