import path from 'path';
import { FileGenerator, PackageJsonGenerator } from '../../../file-generator';
import {
  catalogDependency,
  Dependency,
  PackageJSON,
} from '../../../package-json';
import { PackageGenerator } from '../../../utils/package-generator';
import { getNamespace, getWorkspaceRoot } from '../../../utils/workspace';
import { makeReactEslintConfigGenerator } from '../../files/eslint-config-file-generator';
import { makePrettierConfigFileGenerator } from '../../files/prettier-config-file-generator';
import { makeReactTsconfigFileGenerator } from '../../files/tsconfig-file-generator';
import { BUTTON_FILE_GENERATOR } from './files/button-file-generator';
import { BUTTON_SPEC_FILE_GENERATOR } from './files/button-spec-file-generator';
import { INDEX_FILE_GENERATOR } from './files/index-file-generator';
import { TSUP_CONFIG_FILE_GENERATOR } from './files/tsup-config-file-generator';
import { VITEST_CONFIG_FILE_GENERATOR } from './files/vitest-config-file-generator';

export async function createStyledComponentsReactPackage(
  name: string,
): Promise<void> {
  const rootDir = await getWorkspaceRoot();
  const directory = path.join(rootDir, 'packages', name);

  const namespace = await getNamespace(rootDir);
  const packageName = `${namespace}/${name}`;

  console.log(`✨ Creating Styled Components React library: ${packageName}`);

  const generator = new PackageGenerator(
    directory,
    makeStyledComponentsReactPackageFileGenerators(packageName, namespace),
  );

  await generator.generate();

  console.log(`✅ Library created at: ${directory}`);
}

export function makeStyledComponentsReactPackageFileGenerators(
  packageName: string,
  namespace: string,
): ReadonlyArray<FileGenerator> {
  return [
    makePackageGenerator(packageName, namespace),
    INDEX_FILE_GENERATOR,
    BUTTON_FILE_GENERATOR,
    BUTTON_SPEC_FILE_GENERATOR,
    TSUP_CONFIG_FILE_GENERATOR,
    makeReactTsconfigFileGenerator('tsconfig.json', namespace),
    makePrettierConfigFileGenerator('prettier.config.mjs', namespace),
    makeReactEslintConfigGenerator('eslint.config.mjs', namespace),
    VITEST_CONFIG_FILE_GENERATOR,
  ];
}

function makePackageGenerator(packageName: string, namespace: string) {
  const packageJsonModel = new PackageJSON({
    name: packageName,
    // Peer deps are crucial for Styled Components to prevent "Multiple instances" errors
    peerDependencies: [
      new Dependency('react', '>=18'),
      new Dependency('react-dom', '>=18'),
      new Dependency('styled-components', '>=6'),
    ],
    devDependencies: [
      new Dependency(`${namespace}/eslint-config`, 'workspace:*'),
      new Dependency(`${namespace}/prettier-config`, 'workspace:*'),
      new Dependency(`${namespace}/typescript-config`, 'workspace:*'),
      // Development React binaries
      catalogDependency('react'),
      catalogDependency('react-dom'),
      catalogDependency('@types/react'),
      catalogDependency('@types/react-dom'),
      // Styled Components types and binary for build time
      catalogDependency('styled-components'),
      catalogDependency('@types/styled-components'),
      // Linting & Formatting
      catalogDependency('eslint'),
      catalogDependency('prettier'),
      catalogDependency('prettier-plugin-organize-imports'),
      // Build
      catalogDependency('tsup'),
      // Testing
      catalogDependency('vitest'),
      catalogDependency('@vitest/coverage-v8'),
      catalogDependency('@vitejs/plugin-react'),
      catalogDependency('@testing-library/react'),
      catalogDependency('@testing-library/jest-dom'),
      catalogDependency('jsdom'),
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
        dev: 'tsup --watch', // Helpful for local lib dev
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
