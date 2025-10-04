import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const TSUP_CONFIG = `import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],   // Tree-shakable ESM + CommonJS for broader support
  dts: true,                // Emit type declarations
  sourcemap: true,
  clean: true,
  target: 'esnext',
});
`;

export const TSUP_CONFIG_FILE_GENERATOR = new FileGeneratorImp(
  'tsup.config.ts',
  TSUP_CONFIG,
);
