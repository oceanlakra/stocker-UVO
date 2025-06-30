// src/lib/axios.ts
import axios from 'axios';
import { store } from '@/store'; // To access token or dispatch logout
import { logout } from '@/features/auth/authSlice'; // Import logout thunk for dispatch

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Set base URL from .env
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token || localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors like 401
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized - token might be expired or invalid
      // Dispatch logout action (this will clear token from state and localStorage)
      console.warn('Axios interceptor: Received 401, logging out.');
      store.dispatch(logout());
      // Optionally redirect to login page
      // window.location.href = '/login'; // Or use react-router programmatically
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;