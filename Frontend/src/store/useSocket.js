import { create } from 'zustand';
import { io } from 'socket.io-client';

export const useSocketStore = create((set, get) => ({
  socket: null,
  connect: (user) => {
    if (get().socket || !user) return;

    const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      // Pass user ID for personal notifications (like invites)
      query: { userId: user._id },
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      // Join a personal room for notifications
      newSocket.emit('join', user._id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ socket: null });
    });

    // Set the socket immediately to avoid race conditions
    set({ socket: newSocket });
  },
  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null });
  },
}));
