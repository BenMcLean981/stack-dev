import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'], // Tree-shakable ESM + CommonJS for broader support
  dts: true, // Emit type declarations (via Oxc isolated declarations)
  sourcemap: true,
  clean: true,
  outExtensions({ format }) {
    return {
      js: format === 'es' ? '.mjs' : '.js',
    };
  },
});
