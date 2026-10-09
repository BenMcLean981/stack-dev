import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const SCHEMA_INDEX = `import { builder } from './builder';
import './types/book';

builder.queryType({});
builder.mutationType({});

export const schema = builder.toSchema();
`;

export const SCHEMA_INDEX_FILE_GENERATOR = new FileGeneratorImp(
  'src/schema/index.ts',
  SCHEMA_INDEX,
);
