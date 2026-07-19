import path from 'path';
import { FileGenerator, PackageJsonGenerator } from '../../file-generator';
import { Dependency, PackageJSON } from '../../package-json';
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
    peerDependencies: [
      new Dependency('typescript', '^5.9.3'),
      new Dependency('@types/node', '^25.0.3'),
    ],
    dependencies: [
      new Dependency('fastify', '^5.6.2'),
      new Dependency('@fastify/swagger', '^9.6.1'),
      new Dependency('@fastify/swagger-ui', '^5.2.3'),
      new Dependency('pino-pretty', '^13.1.3'),
    ],
    devDependencies: [
      new Dependency(`${namespace}/eslint-config`, 'workspace:*'),
      new Dependency(`${namespace}/prettier-config`, 'workspace:*'),
      new Dependency(`${namespace}/typescript-config`, 'workspace:*'),
      new Dependency('tsup', '^8.5.1'),
      new Dependency('tsx', '^4.21.0'),
      new Dependency('eslint', '^9.32.0'),
      new Dependency('prettier', '^3.6.2'),
      new Dependency('vitest', '^3.2.4'),
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
