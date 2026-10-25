import { defineConfig } from 'vite';

export default defineConfig({
  base: '/curnomad/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
});
