import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/curnomad/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      strategies: 'injectManifest',
      srcDir: '.',
      filename: 'sw.js',
      injectManifest: {
        swSrc: './sw.js',
        swDest: 'sw.js',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
      manifest: false,
    }),
  ],
});
