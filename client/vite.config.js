import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/socket.io': 'https://your-render-backend-url.onrender.com',
      ws: true,
    },
  },
});
