import { getNamespace, getWorkspaceRoot } from '../../utils/workspace';

import path from 'node:path';
import { PackageJsonGenerator } from '../../file-generator';
import { Dependency } from '../../package-json';
import { PackageGenerator } from '../../utils/package-generator';
import { ADD_FILE_GENERATOR } from './files/add-file-generator';
import { ADD_SPEC_FILE_GENERATOR } from './files/add-spec-file-generator';
import { ESLINT_CONFIG_FILE_GENERATOR } from './files/eslint-config-file-generator';
import { INDEX_FILE_GENERATOR } from './files/index-file-generator';
import { PRETTIER_CONFIG_FILE_GENERATOR } from './files/prettier-config-file-generator';
import { TSCONFIG_FILE_GENERATOR } from './files/tsconfig-file-generator';
import { TSUP_CONFIG_FILE_GENERATOR } from './files/tsup-config-file-generator';
import { VITEST_CONFIG_FILE_GENERATOR } from './files/vitest-config-file-generator';

export async function createLibraryPackage(name: string): Promise<void> {
  const rootDir = await getWorkspaceRoot();
  const directory = path.join(rootDir, 'packages', name);

  const namespace = await getNamespace(rootDir);
  const packageName = `${namespace}/${name}`;

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
      INDEX_FILE_GENERATOR,
      ADD_FILE_GENERATOR,
      ADD_SPEC_FILE_GENERATOR,
      TSUP_CONFIG_FILE_GENERATOR,
      TSCONFIG_FILE_GENERATOR,
      PRETTIER_CONFIG_FILE_GENERATOR,
      ESLINT_CONFIG_FILE_GENERATOR,
      VITEST_CONFIG_FILE_GENERATOR,
    ],
  );

  await generator.generate();

  console.log(`✅ Config package created at: ${directory}`);
}
