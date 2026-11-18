import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Demo 04 runs on its own ports so it never collides with the original site or Demos 01–03.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5176, strictPort: true },
  preview: { port: 4176, strictPort: true },
  build: { target: 'es2022', cssCodeSplit: true, sourcemap: false },
});
