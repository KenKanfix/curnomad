import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const native = mode === 'capacitor';

  return {
    base: native ? './' : '/curnomad/',
    build: {
      outDir: native ? 'dist-native' : 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
    },
  };
});
