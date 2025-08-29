import axios from "axios";

// Use VITE_API_URL if set, otherwise default to localhost
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const axiosInstance = axios.create({
    baseURL: `${API_BASE}/api`,
    withCredentials: true,
});

// Example usage for login:
// axios.post(`${API_BASE}/auth/login`, { email, password });