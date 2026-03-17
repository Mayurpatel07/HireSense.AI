import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;

// 2026-03-24 16:23:00 - perf(frontend): implement code splitting


// 2026-04-05 10:45:00 - feat(frontend): implement Firebase authentication


// 2026-05-08 15:20:00 - refactor(frontend): implement custom hooks


// 2026-05-11 11:18:00 - feat(frontend): add Form components with validation


// Update: 2026-01-01 11:19:00 - fix(frontend): resolve auth redirect loop


// Update: 2026-01-31 11:45:00 - feat(frontend): implement routing with React Router


// Update: 2026-02-06 14:38:00 - chore: configure TypeScript settings


// Update: 2026-03-17 17:49:00 - security: add rate limiting

