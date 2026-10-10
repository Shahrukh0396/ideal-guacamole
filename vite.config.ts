import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Vite only inlines env vars that match this prefix into the browser bundle.
  envPrefix: 'TF_',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/talent-forge/src'),
    },
  },
  server: {
    port: 5173,
  },
});
