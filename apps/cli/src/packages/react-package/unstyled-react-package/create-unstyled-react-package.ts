import path from 'path';
import { FileGenerator, PackageJsonGenerator } from '../../../file-generator';
import { Dependency, PackageJSON } from '../../../package-json';
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

export async function createUnstyledReactPackage(name: string): Promise<void> {
  const rootDir = await getWorkspaceRoot();
  const directory = path.join(rootDir, 'packages', name);

  const namespace = await getNamespace(rootDir);
  const packageName = `${namespace}/${name}`;

  console.log(`✨ Creating Un-styled React library: ${packageName}`);

  const generator = new PackageGenerator(
    directory,
    makeUnstyledReactPackageFileGenerators(packageName, namespace),
  );

  await generator.generate();

  console.log(`✅ Library created at: ${directory}`);
}

export function makeUnstyledReactPackageFileGenerators(
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
    ],
    devDependencies: [
      new Dependency(`${namespace}/eslint-config`, 'workspace:*'),
      new Dependency(`${namespace}/prettier-config`, 'workspace:*'),
      new Dependency(`${namespace}/typescript-config`, 'workspace:*'),
      // Development React binaries
      new Dependency('react', '^18.3.1'),
      new Dependency('react-dom', '^18.3.1'),
      new Dependency('@types/react', '^18.3.1'),
      new Dependency('@types/react-dom', '^18.3.1'),
      // Linting & Formatting
      new Dependency('eslint', '^9.32.0'),
      new Dependency('prettier', '^3.6.2'),
      new Dependency('prettier-plugin-organize-imports', '^4.2.0'),
      // Build
      new Dependency('tsup', '^8.0.0'),
      // Testing
      new Dependency('vitest', '^3.2.4'),
      new Dependency('@vitest/coverage-v8', '^3.2.4'),
      new Dependency('@vitejs/plugin-react', '^4.7.0'),
      new Dependency('@testing-library/react', '^16.0.0'),
      new Dependency('@testing-library/jest-dom', '^6.0.0'),
      new Dependency('jsdom', '^25.0.0'),
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
      // Set to false or removed because Styled Components are pure JS/TS
      sideEffects: false,
    },
  });

  return new PackageJsonGenerator(packageJsonModel, namespace);
}
