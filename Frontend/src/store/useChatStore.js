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
        set({ isMessagesLoading: true });
        try {
            const userId = get().selectedUser?._id;
            const res = await api.get(`/messages/conversation/${userId}/${chatUserId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch messages');
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser } = get();
        try {
            const res = await api.post(`/messages/send/${selectedUser._id}`, messageData);
            // After sending, fetch latest messages for both users
            const messagesRes = await api.get(`/messages/conversation/${selectedUser._id}/${messageData.receiverId}`);
            set({ messages: messagesRes.data });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message');
        }
    },
    // todo:optimize this one later
    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
