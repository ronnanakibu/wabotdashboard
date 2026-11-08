import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const VPS_TARGET = process.env.VITE_BOT_API_URL || 'https://api.ronnproject.my.id';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: VPS_TARGET,
        changeOrigin: true,
        secure: false
      },
      '/status': {
        target: VPS_TARGET,
        changeOrigin: true,
        secure: false
      },
      '/queue': {
        target: VPS_TARGET,
        changeOrigin: true,
        secure: false
      },
      '/history': {
        target: VPS_TARGET,
        changeOrigin: true,
        secure: false
      },
      '/events': {
        target: VPS_TARGET,
        changeOrigin: true,
        secure: false
      },
      '/logs': {
        target: VPS_TARGET,
        changeOrigin: true,
        secure: false
      },
      '/stream': {
        target: VPS_TARGET,
        changeOrigin: true,
        secure: false
      }
    }
  }
});
