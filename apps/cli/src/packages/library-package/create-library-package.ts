import { getNamespace, getWorkspaceRoot } from '../../utils/workspace';

import path from 'node:path';
import { PackageJsonGenerator } from '../../file-generator';
import { FileGeneratorImp } from '../../file-generator/file-generator-imp';
import { Dependency } from '../../package-json';
import { PackageGenerator } from '../../utils/package-generator';

export async function createLibraryPackage(name: string): Promise<void> {
  const rootDir = await getWorkspaceRoot();
  const directory = path.join(rootDir, 'packages', name);

  const namespace = await getNamespace(rootDir);
  const packageName = `@${namespace}/${name}`;

  console.log(`✨ Creating config package: ${packageName}`);

  const generator = new PackageGenerator(
    directory,
    new PackageJsonGenerator(
      packageName,
      [],
      [
        new Dependency('@stack-dev/eslint-config', 'workspace:*'),
        new Dependency('@stack-dev/prettier-config', 'workspace:*'),
        new Dependency('@stack-dev/typescript-config', 'workspace:*'),
        new Dependency('eslint', '^9.32.0'),
        new Dependency('prettier', '^3.6.2'),
        new Dependency('prettier-plugin-organize-imports', '^4.2.0'),
        new Dependency('tsup', '^7.3.0'),
        new Dependency('vitest', '^3.2.4'),
        new Dependency('@vitest/coverage-v8', '^3.2.4'),
      ],
      {
        main: 'dist/index.js',
        module: 'dist/index.mjs', // For ESM consumers
        types: 'dist/index.d.ts', // Type declarations
        exports: {
          '.': {
            import: './dist/index.mjs',
            require: './dist/index.js',
            types: './dist/index.d.ts',
          },
        },
        scripts: {
          build: 'tsup',
          lint: 'eslint',
          format: 'prettier . --write',
          test: 'vitest run',
          'test:watch': 'vitest',
        },
        sideEffects: false, // 🚀 Enables tree-shaking
      },
    ),
    [
      new FileGeneratorImp('src/index.ts', INDEX_TS),
      new FileGeneratorImp('src/add.ts', ADD_TS),
      new FileGeneratorImp('src/spec/add.spec.ts', ADD_SPEC_TS),
      new FileGeneratorImp('tsup.config.ts', TSUP_CONFIG),
      new FileGeneratorImp('tsconfig.json', TSCONFIG),
      new FileGeneratorImp('prettier.config.mjs', PRETTIER_CONFIG),
      new FileGeneratorImp('eslint.config.mjs', ESLINT_CONFIG),
      new FileGeneratorImp('vitest.config.ts', VITEST_CONFIG),
    ],
  );

  await generator.generate();

  console.log(`✅ Config package created at: ${directory}`);
}

const INDEX_TS = `export * from './add';
`;

const ADD_TS = `export function add(n1: number, n2: number): number {
  return n1 + n2;
}
`;

const ADD_SPEC_TS = `import { describe, it, expect } from 'vitest';

import { add } from '../add';

describe('add', () => {
  it('adds two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
});
`;

const TSUP_CONFIG = `import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],   // Tree-shakable ESM + CommonJS for broader support
  dts: true,                // Emit type declarations
  sourcemap: true,
  clean: true,
  target: 'esnext',
});
`;

const TSCONFIG = `{
  "extends": "@stack-dev/typescript-config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
`;

const PRETTIER_CONFIG = `import base from '@stack-dev/prettier-config/base.mjs';

export default base;
`;

const ESLINT_CONFIG = `import base from '@stack-dev/eslint-config/base.mjs';

export default [...base, { ignores: ['**/dist/**'] }];
`;

const VITEST_CONFIG = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
    },
    environment: 'node',
  },
});
`;
