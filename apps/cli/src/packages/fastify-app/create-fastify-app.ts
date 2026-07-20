import path from 'path';
import { FileGenerator, PackageJsonGenerator } from '../../file-generator';
import { catalogDependency, Dependency, PackageJSON } from '../../package-json';
import { PackageGenerator } from '../../utils/package-generator';
import { getNamespace, getWorkspaceRoot } from '../../utils/workspace';

import { makeEslintConfigGenerator } from '../files/eslint-config-file-generator';
import { makePrettierConfigFileGenerator } from '../files/prettier-config-file-generator';
import { makeBaseTsconfigFileGenerator } from '../files/tsconfig-file-generator';
import { INDEX_FILE_GENERATOR } from './files/index-file-generator';
import { TSUP_FILE_GENERATOR } from './files/tsup-file-generator';
import { VITEST_CONFIG_FILE_GENERATOR } from './files/vitest-config-file-generator';

export async function createFastifyApp(name: string): Promise<void> {
  const rootDir = await getWorkspaceRoot();
  const directory = path.join(rootDir, 'apps', name);

  const namespace = await getNamespace(rootDir);
  const packageName = `${namespace}/${name}`;

  console.log(`🚀 Creating Fastify App: ${packageName}`);

  const generator = new PackageGenerator(
    directory,
    makeFastifyAppFileGenerators(packageName, namespace),
  );

  await generator.generate();
}

export function makeFastifyAppFileGenerators(
  packageName: string,
  namespace: string,
): ReadonlyArray<FileGenerator> {
  return [
    makeAppPackageGenerator(packageName, namespace),
    INDEX_FILE_GENERATOR,
    makeBaseTsconfigFileGenerator('tsconfig.json', namespace),
    TSUP_FILE_GENERATOR,
    makePrettierConfigFileGenerator('prettier.config.mjs', namespace),
    makeEslintConfigGenerator('eslint.config.mjs', namespace),
    VITEST_CONFIG_FILE_GENERATOR,
  ];
}

function makeAppPackageGenerator(packageName: string, namespace: string) {
  const packageJsonModel = new PackageJSON({
    name: packageName,
    dependencies: [
      catalogDependency('fastify'),
      catalogDependency('@fastify/swagger'),
      catalogDependency('@fastify/swagger-ui'),
      catalogDependency('pino-pretty'),
    ],
    devDependencies: [
      new Dependency(`${namespace}/eslint-config`, 'workspace:*'),
      new Dependency(`${namespace}/prettier-config`, 'workspace:*'),
      new Dependency(`${namespace}/typescript-config`, 'workspace:*'),
      catalogDependency('@types/node'),
      catalogDependency('typescript'),
      catalogDependency('tsup'),
      catalogDependency('tsx'),
      catalogDependency('eslint'),
      catalogDependency('prettier'),
      catalogDependency('vitest'),
    ],
    additionalData: {
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'tsx watch src/index.ts',
        prebuild: 'pnpm check-types',
        build: 'tsup',
        start: 'node dist/index.mjs',
        'check-types': 'tsc --noEmit',
        lint: 'eslint .',
        format: 'prettier . --write',
        test: 'vitest run',
        'test:watch': 'vitest',
      },
    },
  });

  return new PackageJsonGenerator(packageJsonModel, namespace);
}
