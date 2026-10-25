import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token');
    const user = JSON.parse(localStorage.getItem('imovies_user') || '{}');
    if (token) {
      config.headers['auth-token'] = token;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (user && user.email) {
      config.headers['user-email'] = user.email;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
