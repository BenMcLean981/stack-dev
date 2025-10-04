import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const ADD_TS = `export function add(n1: number, n2: number): number {
  return n1 + n2;
}
`;

export const ADD_FILE_GENERATOR = new FileGeneratorImp('src/add.ts', ADD_TS);
