import path from 'path';
import { FileGenerator, PackageJsonGenerator } from '../../file-generator';
import { catalogDependency, Dependency, PackageJSON } from '../../package-json';
import { PackageGenerator } from '../../utils/package-generator';
import { getNamespace, getWorkspaceRoot } from '../../utils/workspace';

import { INDEX_HTML_FILE_GENERATOR } from './files/index-html-file-generator';
import { MAIN_FILE_GENERATOR } from './files/main-file-generator';
import { VITE_CONFIG_FILE_GENERATOR } from './files/vite-config-file-generator';

import { makeReactOxlintConfigGenerator } from '../files/oxlint-config-file-generator';
import { makePrettierConfigFileGenerator } from '../files/prettier-config-file-generator';
import { makeReactTsconfigFileGenerator } from '../files/tsconfig-file-generator';
import { APP_FILE_GENERATOR } from './files/app-file-generator';
import { VITEST_CONFIG_FILE_GENERATOR } from './files/vitest-config-file-generator';

export async function createViteReactApp(name: string): Promise<void> {
  const rootDir = await getWorkspaceRoot();
  const directory = path.join(rootDir, 'apps', name);

  const namespace = await getNamespace(rootDir);
  const packageName = `${namespace}/${name}`;

  console.log(`🚀 Creating Vite React App: ${packageName}`);

  const generator = new PackageGenerator(
    directory,
    makeViteReactAppFileGenerators(packageName, namespace),
  );

  await generator.generate();
}

export function makeViteReactAppFileGenerators(
  packageName: string,
  namespace: string,
): ReadonlyArray<FileGenerator> {
  return [
    makeAppPackageGenerator(packageName, namespace),
    VITE_CONFIG_FILE_GENERATOR,
    INDEX_HTML_FILE_GENERATOR,
    MAIN_FILE_GENERATOR,
    APP_FILE_GENERATOR,
    makeReactTsconfigFileGenerator('tsconfig.json', namespace),
    makePrettierConfigFileGenerator('prettier.config.mjs', namespace),
    makeReactOxlintConfigGenerator('.oxlintrc.json'),
    VITEST_CONFIG_FILE_GENERATOR,
  ];
}

function makeAppPackageGenerator(packageName: string, namespace: string) {
  const packageJsonModel = new PackageJSON({
    name: packageName,
    dependencies: [
      catalogDependency('react'),
      catalogDependency('react-dom'),
    ],
    devDependencies: [
      new Dependency(`${namespace}/oxlint-config`, 'workspace:*'),
      new Dependency(`${namespace}/prettier-config`, 'workspace:*'),
      new Dependency(`${namespace}/typescript-config`, 'workspace:*'),
      catalogDependency('@types/react'),
      catalogDependency('@types/react-dom'),
      catalogDependency('@vitejs/plugin-react'),
      catalogDependency('vite'),
      catalogDependency('@typescript/native-preview'),
      catalogDependency('oxlint'),
      catalogDependency('prettier'),
      catalogDependency('vitest'),
    ],
    additionalData: {
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsgo && vite build',
        preview: 'vite preview',
        start: 'pnpm run preview',
        'check-types': 'tsgo --noEmit',
        lint: 'oxlint',
        format: 'prettier . --write',
        test: 'vitest run',
        'test:watch': 'vitest',
      },
    },
  });

  return new PackageJsonGenerator(packageJsonModel, namespace);
}
