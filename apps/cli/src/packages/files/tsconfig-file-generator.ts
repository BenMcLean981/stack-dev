import { FileGenerator } from '../../file-generator';
import { FileGeneratorImp } from '../../file-generator/file-generator-imp';

export function makeBaseTsconfigFileGenerator(
  filepath: string,
  namespace: string,
  isolatedDeclarations = false,
): FileGenerator {
  const TSCONFIG = `{
  "extends": "${namespace}/typescript-config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"${isolatedDeclarations ? LIBRARY_OPTIONS : ''}
  },
  "include": ["src"]
}
`;

  return new FileGeneratorImp(filepath, TSCONFIG);
}

export function makeReactTsconfigFileGenerator(
  filepath: string,
  namespace: string,
  isolatedDeclarations = false,
): FileGenerator {
  const TSCONFIG = `{
  "extends": "${namespace}/typescript-config/tsconfig.react.json",
  "compilerOptions": {
    "outDir": "dist"${isolatedDeclarations ? LIBRARY_OPTIONS : ''}
  },
  "include": ["src"]
}
`;

  return new FileGeneratorImp(filepath, TSCONFIG);
}

// Libraries emit type declarations with Oxc via tsdown, which requires
// `isolatedDeclarations` (and thus `declaration`) to be enabled.
const LIBRARY_OPTIONS = `,
    "declaration": true,
    "isolatedDeclarations": true`;
