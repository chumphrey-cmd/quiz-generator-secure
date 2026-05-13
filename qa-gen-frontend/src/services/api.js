import axios from 'axios';

// Create a centralized Axios instance using our environment variable
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// The Interceptor: Runs automatically right before any request leaves the frontend
api.interceptors.request.use(
    (config) => {
        // 1. Standard Auth Token Injection
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // 2. AI BYOK Injection (Only trigger for AI-related endpoints)
        if (config.url && config.url.includes('/explain')) {
            
            // Default to 'gemini' if no provider is set, ensuring backwards compatibility
            const aiProvider = sessionStorage.getItem('ai_provider') || 'gemini';
            const apiKey = sessionStorage.getItem('ai_api_key');

            config.headers['X-AI-Provider'] = aiProvider;

            // Only attach the key if it exists, otherwise let the backend catch the missing key and throw a 401
            if (apiKey) {
                config.headers['X-API-Key'] = apiKey;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;