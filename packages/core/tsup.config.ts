import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],   // Tree-shakable ESM + CommonJS for broader support
  dts: true,                // Emit type declarations
  sourcemap: true,
  clean: true,
  target: 'esnext',
});
