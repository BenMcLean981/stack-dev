import { getNamespace, getWorkspaceRoot } from '../../utils/workspace';

import path from 'node:path';
import { FileGenerator, PackageJsonGenerator } from '../../file-generator';
import { catalogDependency, Dependency, PackageJSON } from '../../package-json';
import { PackageGenerator } from '../../utils/package-generator';
import { makeOxlintConfigGenerator } from '../files/oxlint-config-file-generator';
import { makePrettierConfigFileGenerator } from '../files/prettier-config-file-generator';
import { makeBaseTsconfigFileGenerator } from '../files/tsconfig-file-generator';
import { ADD_FILE_GENERATOR } from './files/add-file-generator';
import { ADD_SPEC_FILE_GENERATOR } from './files/add-spec-file-generator';
import { INDEX_FILE_GENERATOR } from './files/index-file-generator';
import { TSDOWN_CONFIG_FILE_GENERATOR } from './files/tsdown-config-file-generator';
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
    TSDOWN_CONFIG_FILE_GENERATOR,
    makeBaseTsconfigFileGenerator('tsconfig.json', namespace, true),
    makePrettierConfigFileGenerator('prettier.config.mjs', namespace),
    makeOxlintConfigGenerator('.oxlintrc.json'),
    VITEST_CONFIG_FILE_GENERATOR,
  ];
}

function makePackageGenerator(packageName: string, namespace: string) {
  const packageJsonModel = new PackageJSON({
    name: packageName,
    devDependencies: [
      new Dependency(`${namespace}/oxlint-config`, 'workspace:*'),
      new Dependency(`${namespace}/prettier-config`, 'workspace:*'),
      new Dependency(`${namespace}/typescript-config`, 'workspace:*'),
      catalogDependency('typescript'),
      catalogDependency('oxlint'),
      catalogDependency('prettier'),
      catalogDependency('tsdown'),
      catalogDependency('vitest'),
      catalogDependency('@vitest/coverage-v8'),
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
        build: 'tsdown',
        'check-types': 'tsc --noEmit',
        lint: 'oxlint',
        format: 'prettier . --write',
        test: 'vitest run',
        'test:watch': 'vitest',
      },
      sideEffects: false,
    },
  });

  return new PackageJsonGenerator(packageJsonModel, namespace);
}
