import { create } from "zustand";
import toast from "react-hot-toast";
import api from "../api/api"; // Use the custom api instance
import axios from "axios";

const getInitialAuthUser = () => {
	try {
		const storedUser = localStorage.getItem("chat-user");
		// Check for null or the literal string "undefined"
		if (storedUser && storedUser !== "undefined") {
			return JSON.parse(storedUser);
		}
		// If data is missing or corrupted, ensure it's cleared
		localStorage.removeItem("chat-user");
		return null;
	} catch (error) {
		console.error("Failed to parse auth user from localStorage:", error);
		localStorage.removeItem("chat-user"); // Clear corrupted data on error
		return null;
	}
};


export const useAuthStore = create((set) => ({
		authUser: getInitialAuthUser(),
		isCheckingAuth: true,
		isLoggingIn: false,
		isSigningUp: false,
		isLoggingOut: false,
		isUpdatingProfile: false,
		onlineUsers: [],

		// Action to sign up a new user
signup: async (payload) => {
  set({ isSigningUp: true });
  const toastId = toast.loading("Creating account...");
  console.log("Attempting to sign up with payload:", payload); // For debugging
  try {
	const res = await api.post("/auth/signup", payload);

    const data = res.data; // Assuming a flat response like { token, ...user }
    if (data.error) throw new Error(data.error);

    const { token, ...user } = data;
    if (!token || !user._id) {
      throw new Error("Invalid response from server on signup");
    }

    localStorage.setItem("chat-user", JSON.stringify(user)); // Store the user object
    localStorage.setItem("chat-user-token", token);
    set({ authUser: user }); // Set authUser to just the user object
    toast.success("Account created successfully!", { id: toastId });
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "An unknown error occurred";
    toast.error(errorMessage, { id: toastId });
    throw error; // Re-throw the error so the component can catch it if needed
  } finally {
    set({ isSigningUp: false });
  }
},



		// Action to log in a user
		login: async (credentials) => {
			set({ isLoggingIn: true });
			const toastId = toast.loading("Logging in...");
			try {
				const res = await api.post("/auth/login", credentials);
				const data = res.data;

				const { token, ...user } = data;
				if (!token || !user._id) {
					throw new Error("Invalid response from server on login");
				}

				localStorage.setItem("chat-user", JSON.stringify(user));
				localStorage.setItem("chat-user-token", token);
				set({ authUser: user });
				toast.success("Login successful!", { id: toastId });
			} catch (error) {
				const errorMessage = error.response?.data?.message || error.message || "Login failed. Please check your credentials.";
				toast.error(errorMessage, { id: toastId });
				throw error; // Re-throw so the component knows it failed
			} finally {
				set({ isLoggingIn: false });
			}
		},

	// Action to log out a user
	logout: async () => {
		set({ isLoggingOut: true });
		const toastId = toast.loading("Logging out...");
		try {
			await api.post("/auth/logout");
			localStorage.removeItem("chat-user");
			localStorage.removeItem("chat-user-token");
			set({ authUser: null });
			toast.success("Logged out successfully!", { id: toastId });
			// Force a redirect to the signup page after state has been cleared.
			window.location.href = "/signup";
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Logout failed";
			toast.error(errorMessage, { id: toastId });
			throw error; // Re-throw the error so the component can catch it if needed
		} finally {
			set({ isLoggingOut: false });
		}
	},

	// Action to check if a user is already authenticated (e.g., on page load)
	checkAuth: async () => {
		set({ isCheckingAuth: true });
		const token = localStorage.getItem("chat-user-token");
		if (!token) {
			set({ authUser: null, isCheckingAuth: false });
			return;
		}
		try {
			const res = await api.get("/auth/me");
			// The /me endpoint should return the user object directly
			set({ authUser: res.data });
		} catch (error) {
			// This is expected if the user is not logged in (e.g., 401 Unauthorized)
			set({ authUser: null });
		} finally {
			set({ isCheckingAuth: false });
		}
	},

	updateProfile: async (data) => {
		set({ isUpdatingProfile: true });
		const toastId = toast.loading("Updating profile...");
		try {
			let payload;
			let config = {};
			if (data.profilePic instanceof File) {
				payload = new FormData();
				Object.entries(data).forEach(([key, value]) => {
					if (value !== undefined && value !== null) {
						payload.append(key, value);
					}
				});
				config.headers = { 'Content-Type': 'multipart/form-data' };
			} else {
				payload = data;
			}
			const res = await api.put("/auth/update-profile", payload, config);
			const updatedUser = res.data;

			set({ authUser: updatedUser });
			localStorage.setItem("chat-user", JSON.stringify(updatedUser));
			toast.success("Profile updated successfully!", { id: toastId });
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Failed to update profile.";
			console.error("updateProfile error: ", error);
			toast.error(errorMessage, { id: toastId });
			// Re-throw the error so components can handle the failed state if needed
			throw error;
		} finally {
			set({ isUpdatingProfile: false });
		}
	},
}));
