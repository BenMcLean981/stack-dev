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

export const EXECUTE_OPERATION_FILE_GENERATOR = new FileGeneratorImp(
  'src/spec/helpers/execute-operation.ts',
  EXECUTE_OPERATION,
);
