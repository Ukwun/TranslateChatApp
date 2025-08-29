import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()], 
	server: {
		port: 3000,
		proxy: {
					"/api": {
						target: "http://localhost:5000", // Your backend server address
						changeOrigin: true,
					},
					
					"/socket.io": {
						target: "http://localhost:5000",
						ws: true,
						changeOrigin: true,
					},					
		},
	},
});