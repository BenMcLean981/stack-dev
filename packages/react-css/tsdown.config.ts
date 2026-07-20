import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  minify: true,
  clean: true,
  // Inline component styles into the JS bundle so consumers get them
  // automatically (equivalent to tsup's `injectStyle`).
  css: {
    inject: true,
  },
  outExtensions({ format }) {
    return {
      js: format === 'es' ? '.mjs' : '.js',
    };
  },
});
