import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const VITEST_CONFIG = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
    },
    environment: 'node',
  },
});
`;

export const VITEST_CONFIG_FILE_GENERATOR = new FileGeneratorImp(
  'vitest.config.ts',
  VITEST_CONFIG,
);
