import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false,
  sourcemap: true,
  clean: true,
  platform: 'node',
  banner: {
    js: '#!/usr/bin/env node',
  },
  outExtensions({ format }) {
    return {
      js: format === 'es' ? '.mjs' : '.js',
    };
  },
});
