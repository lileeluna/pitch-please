import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "https://pitch-please-yo0l.onrender.com",
      "/uploads": "https://pitch-please-yo0l.onrender.com",
    },
  },
});
