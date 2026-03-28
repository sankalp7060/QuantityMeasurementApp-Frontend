import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        setUser(response.user);
        navigate('/dashboard');
        return { success: true };
      }
      // Return the actual error message from backend
      let message = response.message || 'Invalid credentials';
      
      // Check for specific error messages from backend
      if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('not found')) {
        message = 'Invalid username/email or password';
      } else if (message.toLowerCase().includes('deactivated')) {
        message = 'Account is deactivated. Please contact support.';
      }
      
      return { success: false, message };
    } catch (err) {
      let message = 'Invalid username/email or password';
      
      // Handle different error scenarios
      if (err.response?.status === 401) {
        message = err.response?.data?.message || 'Invalid username/email or password';
      } else if (err.response?.status === 400) {
        message = err.response?.data?.message || 'Invalid request';
      } else if (err.response?.status === 403) {
        message = 'Account locked. Too many failed attempts.';
      } else if (err.message === 'Network Error') {
        message = 'Cannot connect to server. Please check if backend is running.';
      } else if (err.code === 'ECONNABORTED') {
        message = 'Request timeout. Please try again.';
      }
      
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      if (response.success) {
        setUser(response.user);
        navigate('/dashboard');
        return { success: true };
      }
      return { success: false, message: response.message || 'Registration failed' };
    } catch (err) {
      let message = 'Registration failed';
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        message = Object.values(errors).flat()[0] || 'Registration failed';
      } else if (err.message === 'Network Error') {
        message = 'Cannot connect to server. Please check if backend is running.';
      }
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    navigate('/login');
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};