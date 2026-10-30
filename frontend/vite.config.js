import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite development proxy - forwards /api calls to our API Gateway
// This way the frontend never hardcodes http://localhost:8080
// It just calls /api/auth/login and Vite proxies it to the gateway
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/ws": {
        target: "http://localhost:8086",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
