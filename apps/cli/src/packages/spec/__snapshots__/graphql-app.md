## .oxlintrc.json

```
{
  "extends": ["../../configs/oxlint-config/base.oxlintrc.json"],
  "ignorePatterns": ["**/dist/**"]
}
```

## oxfmt.config.mts

```
import config from '@acme/oxfmt-config/base';

export default config;
```

## package.json

```
{
  "name": "@acme/widget",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "prebuild": "pnpm check-types",
    "build": "tsdown",
    "start": "node dist/index.mjs",
    "check-types": "tsc --noEmit",
    "lint": "oxlint",
    "format": "oxfmt .",
    "format:check": "oxfmt --check .",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@pothos/core": "catalog:",
    "graphql": "catalog:",
    "graphql-yoga": "catalog:"
  },
  "devDependencies": {
    "@acme/oxfmt-config": "workspace:*",
    "@acme/oxlint-config": "workspace:*",
    "@acme/typescript-config": "workspace:*",
    "@types/node": "catalog:",
    "@vitest/coverage-v8": "catalog:",
    "oxfmt": "catalog:",
    "oxlint": "catalog:",
    "tsdown": "catalog:",
    "tsx": "catalog:",
    "typescript": "catalog:",
    "vitest": "catalog:"
  },
  "type": "module"
}
```

## src/books.ts

```
export interface Book {
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
```

## src/context.ts

```
import { Books } from './books';

/**
 * Everything a resolver is allowed to reach for.
 *
 * Resolvers take this rather than importing their dependencies directly, so a
 * test can hand them an in-memory substitute.
 */
export interface Context {
  books: Books;
}
```

## src/index.ts

```
import { createServer } from 'node:http';

import { createYoga } from 'graphql-yoga';

import { createBooks } from './books';
import { Context } from './context';
import { schema } from './schema/index';

const PORT = Number(process.env.PORT ?? 4000);

const books = createBooks();

const yoga = createYoga<Record<string, never>, Context>({
  schema,
  context: () => ({ books }),
});

// Yoga is a request handler rather than a framework, so routes outside
// GraphQL are plain handlers alongside it.
const server = createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'text/plain' });
    response.end('ok');

    return;
  }

  yoga(request, response);
});

server.listen(PORT, () => {
  console.info(`Server listening on http://localhost:${PORT}/graphql`);
});
```

## src/schema/builder.ts

```
import SchemaBuilder from '@pothos/core';

import { Context } from '../context';

export const builder = new SchemaBuilder<{ Context: Context }>({});
```

## src/schema/index.ts

```
import { builder } from './builder';
import './types/book';

builder.queryType({});
builder.mutationType({});

export const schema = builder.toSchema();
```

## src/schema/types/book.ts

```
import { Book } from '../../books';
import { builder } from '../builder';

const BookRef = builder.objectRef<Book>('Book').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    author: t.exposeString('author'),
  }),
});

builder.queryFields((t) => ({
  books: t.field({
    type: [BookRef],
    resolve: (_parent, _args, context) => context.books.list(),
  }),
  book: t.field({
    type: BookRef,
    nullable: true,
    args: { id: t.arg.id({ required: true }) },
    resolve: (_parent, args, context) => context.books.find(String(args.id)),
  }),
}));

builder.mutationFields((t) => ({
  addBook: t.field({
    type: BookRef,
    args: {
      title: t.arg.string({ required: true }),
      author: t.arg.string({ required: true }),
    },
    resolve: (_parent, args, context) =>
      context.books.add({ title: args.title, author: args.author }),
  }),
}));
```

## src/spec/helpers/execute-operation.ts

```
import { createYoga } from 'graphql-yoga';

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
 * `maskedErrors` is off so a test can assert on the actual message.
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
```

## src/spec/schema/book.spec.ts

```
import { describe, expect, it } from 'vitest';

import { createBooks } from '../../books';
import { executeOperation } from '../helpers/execute-operation';

const BOOKS = /* GraphQL */ `
  query Books {
    books {
      id
      title
      author
    }
  }
`;

const ADD_BOOK = /* GraphQL */ `
  mutation AddBook($title: String!, $author: String!) {
    addBook(title: $title, author: $author) {
      id
      title
      author
    }
  }
`;

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
```

## tsconfig.json

```
{
  "extends": "@acme/typescript-config/tsconfig.base.json",
  "compilerOptions": {
    "types": ["node"],
    "outDir": "dist"
  },
  "include": ["src"]
}
```

## tsdown.config.ts

```
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  platform: 'node',
  outExtensions({ format }) {
    return {
      js: format === 'es' ? '.mjs' : '.js',
    };
  },
});
```

## vitest.config.ts

```
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
    },
    environment: 'node',
  },
});
```
