import { getNamespace, getWorkspaceRoot } from '../../utils/workspace';

import path from 'node:path';
import { FileGenerator, PackageJsonGenerator } from '../../file-generator';
import { Dependency, PackageJSON } from '../../package-json';
import { PackageGenerator } from '../../utils/package-generator';
import { makeEslintConfigGenerator } from '../files/eslint-config-file-generator';
import { makePrettierConfigFileGenerator } from '../files/prettier-config-file-generator';
import { makeBaseTsconfigFileGenerator } from '../files/tsconfig-file-generator';
import { ADD_FILE_GENERATOR } from './files/add-file-generator';
import { ADD_SPEC_FILE_GENERATOR } from './files/add-spec-file-generator';
import { INDEX_FILE_GENERATOR } from './files/index-file-generator';
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
    makeLibraryPackageFileGenerators(packageName, namespace),
  );

  await generator.generate();

  console.log(`✅ Config package created at: ${directory}`);
}

export function makeLibraryPackageFileGenerators(
  packageName: string,
  namespace: string,
): ReadonlyArray<FileGenerator> {
  return [
    makePackageGenerator(packageName, namespace),
    INDEX_FILE_GENERATOR,
    ADD_FILE_GENERATOR,
    ADD_SPEC_FILE_GENERATOR,
    TSUP_CONFIG_FILE_GENERATOR,
    makeBaseTsconfigFileGenerator('tsconfig.json', namespace),
    makePrettierConfigFileGenerator('prettier.config.mjs', namespace),
    makeEslintConfigGenerator('eslint.config.mjs', namespace),
    VITEST_CONFIG_FILE_GENERATOR,
  ];
}

function makePackageGenerator(packageName: string, namespace: string) {
  const packageJsonModel = new PackageJSON({
    name: packageName,
    devDependencies: [
      new Dependency(`${namespace}/eslint-config`, 'workspace:*'),
      new Dependency(`${namespace}/prettier-config`, 'workspace:*'),
      new Dependency(`${namespace}/typescript-config`, 'workspace:*'),
      new Dependency('eslint', '^9.32.0'),
      new Dependency('prettier', '^3.6.2'),
      new Dependency('prettier-plugin-organize-imports', '^4.2.0'),
      new Dependency('tsup', '^7.3.0'),
      new Dependency('vitest', '^3.2.4'),
      new Dependency('@vitest/coverage-v8', '^3.2.4'),
    ],
    additionalData: {
      version: '0.1.0',
      private: true,
      type: 'module',
      main: 'dist/index.js',
      module: 'dist/index.mjs',
      types: 'dist/index.d.ts',
      exports: {
        '.': {
          development: './src/index.ts',
          types: './dist/index.d.ts',
          import: './dist/index.mjs',
          require: './dist/index.js',
        },
      },
      scripts: {
        prebuild: 'pnpm check-types',
        build: 'tsup',
        'check-types': 'tsc --noEmit',
        lint: 'eslint .',
        format: 'prettier . --write',
        test: 'vitest run',
        'test:watch': 'vitest',
      },
      sideEffects: false,
    },
  });

  return new PackageJsonGenerator(packageJsonModel, namespace);
}
