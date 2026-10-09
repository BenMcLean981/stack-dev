import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const CONTEXT = `import { Books } from './books';

/**
 * Everything a resolver is allowed to reach for.
 *
 * Resolvers take this rather than importing their dependencies directly, so a
 * test can hand them an in-memory substitute.
 */
export interface Context {
  books: Books;
}
`;

export const CONTEXT_FILE_GENERATOR = new FileGeneratorImp(
  'src/context.ts',
  CONTEXT,
);
