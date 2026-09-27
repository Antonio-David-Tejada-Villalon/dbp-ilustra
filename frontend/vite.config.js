import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En desarrollo, /api y /admin se envían al backend (uvicorn en el puerto 8000).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
      "/admin": "http://localhost:8000",
      "/static": "http://localhost:8000",
    },
  },
});
