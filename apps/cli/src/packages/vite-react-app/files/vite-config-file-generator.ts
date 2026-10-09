import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const VITE_CONFIG = `import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
`;

export const VITE_CONFIG_FILE_GENERATOR = new FileGeneratorImp(
  'vite.config.ts',
  VITE_CONFIG,
);
