import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const PRETTIER_CONFIG = `import base from '@stack-dev/prettier-config/base.mjs';

export default base;
`;

export const PRETTIER_CONFIG_FILE_GENERATOR = new FileGeneratorImp(
  'prettier.config.mjs',
  PRETTIER_CONFIG,
);
