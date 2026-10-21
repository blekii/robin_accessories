import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `/api/*` is forwarded to the PHP server: php -S localhost:8000 -t backend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true },
    },
  },
});
