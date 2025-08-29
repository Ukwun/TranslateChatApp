import { create } from "zustand";


export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "coffee",
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem("chat-theme", theme);
    // Set theme globally on <html>
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
}));
