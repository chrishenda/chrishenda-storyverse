import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react(), tailwindcss()],
      // Do not inject secret API keys into the client bundle
      define: {},
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // Dev-only proxy for local API server
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/ai': { target: 'http://localhost:8080', changeOrigin: true },
          '/merge': { target: 'http://localhost:8080', changeOrigin: true },
          '/videos': { target: 'http://localhost:8080', changeOrigin: true },
          '/health': { target: 'http://localhost:8080', changeOrigin: true },
        }
      }
    };
});
