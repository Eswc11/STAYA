import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    
    if (error.response?.status === 422) {
      console.error('Validation error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export const auth = {
  register: (username, email, password) =>
    api.post('/api/register/', { username, email, password }),
  
  login: async (username, password) => {
    try {
      const response = await api.post('/api-token-auth/', {
        username: username,
        password: password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.user_id,
          username: username
        }));
        return response;
      }
      throw new Error('No token received');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export const tasks = {
  getAll: () => api.get('/api/tasks/'),
  create: (task) => api.post('/api/tasks/', task),
  update: (id, task) => api.put(`/api/tasks/${id}/`, task),
  delete: (id) => api.delete(`/api/tasks/${id}/`),
  toggleComplete: (id) => api.post(`/api/tasks/${id}/toggle_complete/`),
};

export const user = {
  getProfile: () => api.get('/api/user/profile'),
};

export default api; 