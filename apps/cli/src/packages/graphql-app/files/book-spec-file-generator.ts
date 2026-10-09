import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

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

export const BOOK_SPEC_FILE_GENERATOR = new FileGeneratorImp(
  'src/spec/schema/book.spec.ts',
  BOOK_SPEC,
);
