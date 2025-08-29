import axios from 'axios';

// Create an Axios instance with a base URL.
// All requests made with this instance will be prefixed with '/api'.
const api = axios.create({
  baseURL: '/api',
});

// Add a request interceptor to include the token in every request.
api.interceptors.request.use(
  (config) => {
    // Retrieve the token from localStorage.
    // Adjust this if you store the token elsewhere (e.g., cookies, context).
    const token = localStorage.getItem('chat-user-token');

    if (token) {
      // If the token exists, add it to the Authorization header.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

