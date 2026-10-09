import { FileGenerator } from '../../../file-generator';
import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const BUILDER = `import SchemaBuilder from '@pothos/core';

import { Context } from '../context';

export const builder = new SchemaBuilder<{ Context: Context }>({});
`;

const INDEX = `import { builder } from './builder';
import './types/book';

builder.queryType({});
builder.mutationType({});

export const schema = builder.toSchema();
`;

const BOOK = `import { Book } from '../../books';
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
`;

export const SCHEMA_FILE_GENERATORS: ReadonlyArray<FileGenerator> = [
  new FileGeneratorImp('src/schema/builder.ts', BUILDER),
  new FileGeneratorImp('src/schema/index.ts', INDEX),
  new FileGeneratorImp('src/schema/types/book.ts', BOOK),
];
