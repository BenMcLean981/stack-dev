import { FileGeneratorImp } from '../../../../file-generator/file-generator-imp';

const VITEST_CONFIG = `import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    css: true,
  },
});
`;

export const VITEST_CONFIG_FILE_GENERATOR = new FileGeneratorImp(
  'vitest.config.ts',
  VITEST_CONFIG,
);
