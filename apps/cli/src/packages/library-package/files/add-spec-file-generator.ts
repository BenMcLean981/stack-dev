import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const ADD_SPEC_TS = `import { describe, it, expect } from 'vitest';

import { add } from '../add';

describe('add', () => {
  it('adds two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
});
`;

export const ADD_SPEC_FILE_GENERATOR = new FileGeneratorImp(
  'src/spec/add.spec.ts',
  ADD_SPEC_TS,
);
