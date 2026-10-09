import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const BUILDER = `import SchemaBuilder from '@pothos/core';

import { Context } from '../context';

export const builder = new SchemaBuilder<{ Context: Context }>({});
`;

export const SCHEMA_BUILDER_FILE_GENERATOR = new FileGeneratorImp(
  'src/schema/builder.ts',
  BUILDER,
);
