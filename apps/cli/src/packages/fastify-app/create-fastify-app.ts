import path from 'path';
import { FileGenerator, PackageJsonGenerator } from '../../file-generator';
import { catalogDependency, Dependency, PackageJSON } from '../../package-json';
import { PackageGenerator } from '../../utils/package-generator';
import { getNamespace, getWorkspaceRoot } from '../../utils/workspace';

import { makeOxlintConfigGenerator } from '../files/oxlint-config-file-generator';
import { makePrettierConfigFileGenerator } from '../files/prettier-config-file-generator';
import { makeBaseTsconfigFileGenerator } from '../files/tsconfig-file-generator';
import { INDEX_FILE_GENERATOR } from './files/index-file-generator';
import { TSDOWN_FILE_GENERATOR } from './files/tsdown-file-generator';
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
    TSDOWN_FILE_GENERATOR,
    makePrettierConfigFileGenerator('prettier.config.mjs', namespace),
    makeOxlintConfigGenerator('.oxlintrc.json'),
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
      new Dependency(`${namespace}/oxlint-config`, 'workspace:*'),
      new Dependency(`${namespace}/prettier-config`, 'workspace:*'),
      new Dependency(`${namespace}/typescript-config`, 'workspace:*'),
      catalogDependency('@types/node'),
      catalogDependency('typescript'),
      catalogDependency('tsdown'),
      catalogDependency('tsx'),
      catalogDependency('oxlint'),
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
        build: 'tsdown',
        start: 'node dist/index.mjs',
        'check-types': 'tsc --noEmit',
        lint: 'oxlint',
        format: 'prettier . --write',
        test: 'vitest run',
        'test:watch': 'vitest',
      },
    },
  });

  return new PackageJsonGenerator(packageJsonModel, namespace);
}
