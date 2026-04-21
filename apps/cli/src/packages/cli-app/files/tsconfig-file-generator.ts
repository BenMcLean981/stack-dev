import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

export function makeTsconfigFileGenerator(filepath: string, namespace: string): FileGeneratorImp {
  const TSCONFIG = `{
  "extends": "${namespace}/typescript-config/tsconfig.base.json",
  "compilerOptions": {
    "types": ["node"],
    "outDir": "dist"
  },
  "include": ["src"]
}
`;

  return new FileGeneratorImp(filepath, TSCONFIG);
}

