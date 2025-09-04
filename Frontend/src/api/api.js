import axios from 'axios';

// Create an Axios instance with a base URL.
// All requests made with this instance will be prefixed with '/api'.
const api = axios.create({
  baseURL: (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000") + "/api", 
  withCredentials: true
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


// Login helper function
export const login = async (credentials) => {
  return api.post("/auth/login", credentials);
};

// Admin room API helpers
export const getAdminRooms = async (adminId) => {
  return api.get(`/admin/rooms?adminId=${adminId}`);
};
export const createAdminRoom = async (name, memberIds) => {
  return api.post("/admin/create", { name, memberIds });
};
export const getRoomMembers = async (roomId) => {
  return api.get(`/admin/${roomId}/members`);
};
export const changeMemberNickname = async (roomId, memberId, nickname) => {
  return api.put(`/admin/${roomId}/nickname`, { memberId, nickname });
};
export const removeRoomMember = async (roomId, memberId) => {
  return api.delete(`/admin/${roomId}/member/${memberId}`);
};

export default api;

