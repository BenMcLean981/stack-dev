import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const BOOKS = `export interface Book {
  id: string;
  title: string;
  author: string;
}

/**
 * Stands in for whatever really stores your data. Swap it for a database
 * client and the resolvers do not change, because they only see this
 * interface through the context.
 */
export interface Books {
  list(): Promise<ReadonlyArray<Book>>;
  find(id: string): Promise<Book | undefined>;
  add(book: Omit<Book, 'id'>): Promise<Book>;
}

export function createBooks(seed: ReadonlyArray<Book> = SEED): Books {
  const books = new Map(seed.map((book) => [book.id, book]));

  let nextId = books.size + 1;

  return {
    list: async () => [...books.values()],
    find: async (id) => books.get(id),
    add: async (book) => {
      const added = { ...book, id: String(nextId) };

      nextId += 1;
      books.set(added.id, added);

      return added;
    },
  };
}

const SEED: ReadonlyArray<Book> = [
  { id: '1', title: 'The Mythical Man-Month', author: 'Fred Brooks' },
  { id: '2', title: 'Refactoring', author: 'Martin Fowler' },
];
`;

export const BOOKS_FILE_GENERATOR = new FileGeneratorImp('src/books.ts', BOOKS);
