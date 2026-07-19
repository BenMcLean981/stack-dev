import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // Mirrors the tsconfig path mapping so tests run against core's source
      // rather than requiring it to be built first.
      '@stack-dev/core': path.resolve(
        import.meta.dirname,
        '../../packages/core/src/index.ts',
      ),
    },
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
    },
    environment: 'node',
  },
});
