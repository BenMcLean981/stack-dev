import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const TSDOWN_CONFIG = `import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  outExtensions({ format }) {
    return {
      js: format === 'es' ? '.mjs' : '.js',
    };
  },
});
`;

export const TSDOWN_CONFIG_FILE_GENERATOR = new FileGeneratorImp(
  'tsdown.config.ts',
  TSDOWN_CONFIG,
);
