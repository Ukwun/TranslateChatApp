import { create } from "zustand";
import toast from "react-hot-toast";
import api from "../api/api";


export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,


    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await api.get('/messages/users');
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch users');
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (chatUserId) => {
        if (!chatUserId) {
            return set({ messages: [] });
        }
        set({ isMessagesLoading: true });
        try {
            const res = await api.get(`/messages/${chatUserId}`);
            set({ messages: res.data });
        } catch (error) {
            console.error("❌ Fetch messages error: ", error);
            toast.error(error.response?.data?.message || 'Failed to fetch messages');
            set({ messages: [] });
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        if (!selectedUser) return;
        try {
            const res = await api.post(`/messages/send/${selectedUser._id}`, messageData);
            // Append the new message returned from the API to the local state
            set({ messages: [...messages, res.data] });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message');
        }
    },
    // todo:optimize this one later
    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
