const API_BASE_URL = 'http://localhost:5000/api/v1';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    
    const token = localStorage.getItem('accessToken');
    if (token && options.requiresAuth !== false) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        credentials: 'include',
    };
    
    try {
        const response = await fetch(url, config);
        
        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401 && options.requiresAuth !== false) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // Retry with new token
                const newToken = localStorage.getItem('accessToken');
                config.headers['Authorization'] = `Bearer ${newToken}`;
                const retryResponse = await fetch(url, config);
                return await retryResponse.json();
            } else {
                // Refresh failed, redirect to login
                localStorage.clear();
                window.location.href = '/login.html';
                throw new Error('Session expired');
            }
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function refreshAccessToken() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return false;
        
        const response = await fetch(`${API_BASE_URL}/Auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
            credentials: 'include',
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Refresh token error:', error);
        return false;
    }
}

// Auth Service
const authService = {
    async register(data) {
        const response = await apiRequest('/Auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
            requiresAuth: false,
        });
        
        if (response.success) {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    },
    
    async login(data) {
        const response = await apiRequest('/Auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
            requiresAuth: false,
        });
        
        if (response.success) {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    },
    
    async logout() {
        try {
            await apiRequest('/Auth/logout', {
                method: 'POST',
                body: JSON.stringify({}),
            });
        } finally {
            localStorage.clear();
            window.location.href = '/login.html';
        }
    },
    
    googleLogin() {
        window.location.href = 'http://localhost:5000/api/v1/Auth/google/login';
    }
};

// Quantities Service
const quantitiesService = {
    async convert(data) {
        return await apiRequest('/Quantities/convert', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    
    async compare(data) {
        return await apiRequest('/Quantities/compare', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    
    async add(data) {
        return await apiRequest('/Quantities/add', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    
    async subtract(data) {
        return await apiRequest('/Quantities/subtract', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    
    async divide(data) {
        return await apiRequest('/Quantities/divide', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    
    async getHistory() {
        return await apiRequest('/Quantities/history', { method: 'GET' });
    },
    
    async getStatistics() {
        return await apiRequest('/Quantities/statistics', { method: 'GET' });
    }
};