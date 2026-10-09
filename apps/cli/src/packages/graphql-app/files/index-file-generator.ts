import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const INDEX = `import { createServer } from 'node:http';

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
  console.info(\`Server listening on http://localhost:\${PORT}/graphql\`);
});
`;

export const INDEX_FILE_GENERATOR = new FileGeneratorImp('src/index.ts', INDEX);
