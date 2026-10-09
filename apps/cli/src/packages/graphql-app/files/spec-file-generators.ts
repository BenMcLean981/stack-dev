import { FileGenerator } from '../../../file-generator';
import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const EXECUTE_OPERATION = `import { createYoga } from 'graphql-yoga';

import { Context } from '../../context';
import { schema } from '../../schema/index';

export type OperationResult = {
  data?: Record<string, unknown> | null;
  errors?: Array<{ message: string }>;
};

/**
 * Runs an operation against the real schema without binding a port.
 *
 * Yoga is built on fetch, so the request goes through the whole server —
 * parsing, validation, error handling — and comes back as a Response.
 * \`maskedErrors\` is off so a test can assert on the actual message.
 */
export async function executeOperation(options: {
  query: string;
  variables?: Record<string, unknown>;
  context: Context;
}): Promise<OperationResult> {
  const yoga = createYoga<Record<string, never>, Context>({
    schema,
    logging: false,
    maskedErrors: false,
    context: () => options.context,
  });

  const response = await yoga.fetch('http://localhost/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: options.query,
      variables: options.variables,
    }),
  });

  return response.json() as Promise<OperationResult>;
}
`;

const BOOK_SPEC = `import { describe, expect, it } from 'vitest';

import { createBooks } from '../../books';
import { executeOperation } from '../helpers/execute-operation';

const BOOKS = /* GraphQL */ \`
  query Books {
    books {
      id
      title
      author
    }
  }
\`;

const ADD_BOOK = /* GraphQL */ \`
  mutation AddBook($title: String!, $author: String!) {
    addBook(title: $title, author: $author) {
      id
      title
      author
    }
  }
\`;

describe('books', () => {
  it('returns the seeded books', async () => {
    const result = await executeOperation({
      query: BOOKS,
      context: { books: createBooks() },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.books).toHaveLength(2);
  });

  it('adds a book and gives it an id', async () => {
    const context = { books: createBooks() };

    const result = await executeOperation({
      query: ADD_BOOK,
      variables: { title: 'Clean Code', author: 'Robert Martin' },
      context,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.addBook).toMatchObject({
      title: 'Clean Code',
      author: 'Robert Martin',
    });
    expect(await context.books.list()).toHaveLength(3);
  });
});
`;

export const SPEC_FILE_GENERATORS: ReadonlyArray<FileGenerator> = [
  new FileGeneratorImp(
    'src/spec/helpers/execute-operation.ts',
    EXECUTE_OPERATION,
  ),
  new FileGeneratorImp('src/spec/schema/book.spec.ts', BOOK_SPEC),
];
