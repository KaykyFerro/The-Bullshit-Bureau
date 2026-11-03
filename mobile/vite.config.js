import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(import.meta.dirname, 'src'),
  base: './',
  publicDir: resolve(import.meta.dirname, 'src/public'),
  build: {
    outDir: resolve(import.meta.dirname, 'www'),
    emptyOutDir: true,
    sourcemap: false,
    target: 'es2022'
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  }
});
