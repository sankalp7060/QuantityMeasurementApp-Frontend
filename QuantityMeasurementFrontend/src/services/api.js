import axios from 'axios';
import toast from 'react-hot-toast';

// Use environment variable with fallback for production
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://quantitymeasurementapp-yffo.onrender.com/api/v1'
    : 'http://localhost:5000/api/v1');

console.log('API Base URL:', API_BASE_URL); // For debugging

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await axios.post(`${API_BASE_URL}/Auth/refresh-token`, {
          refreshToken,
        });
        
        if (response.data.success) {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.clear();
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }
    }
    
    // Handle connection errors
    if (error.code === 'ERR_NETWORK') {
      toast.error('Cannot connect to server. Please check your connection.');
    } else {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (data) => {
    const response = await api.post('/Auth/register', data);
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  login: async (data) => {
    const response = await api.post('/Auth/login', data);
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  logout: async () => {
    try {
      await api.post('/Auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      window.location.href = '/login';
    }
  },
  
  getProfile: async () => {
    const response = await api.get('/Auth/profile');
    return response.data;
  },
  
  googleLogin: () => {
    window.location.href = `${API_BASE_URL}/Auth/google/login`;
  },
};

export const quantitiesService = {
  convert: async (data) => (await api.post('/Quantities/convert', data)).data,
  compare: async (data) => (await api.post('/Quantities/compare', data)).data,
  add: async (data) => (await api.post('/Quantities/add', data)).data,
  subtract: async (data) => (await api.post('/Quantities/subtract', data)).data,
  divide: async (data) => (await api.post('/Quantities/divide', data)).data,
  getHistory: async () => (await api.get('/Quantities/history')).data,
  getStatistics: async () => (await api.get('/Quantities/statistics')).data,
};