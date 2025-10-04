import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const ESLINT_CONFIG = `import base from '@stack-dev/eslint-config/base.mjs';

export default [...base, { ignores: ['**/dist/**'] }];
`;

export const ESLINT_CONFIG_FILE_GENERATOR = new FileGeneratorImp(
  'eslint.config.mjs',
  ESLINT_CONFIG,
);
