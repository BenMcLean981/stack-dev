import path from 'path';
import { PackageJsonGenerator } from '../../file-generator';
import { Dependency, PackageJSON } from '../../package-json';
import { PackageGenerator } from '../../utils/package-generator';
import { getNamespace, getWorkspaceRoot } from '../../utils/workspace';
import { makeEslintConfigGenerator } from '../files/eslint-config-file-generator';
import { makePrettierConfigFileGenerator } from '../files/prettier-config-file-generator';
import { INDEX_FILE_GENERATOR } from './files/index-file-generator';
import { TSUP_FILE_GENERATOR } from './files/tsup-file-generator';
import { VITEST_CONFIG_FILE_GENERATOR } from './files/vitest-config-file-generator';
import { makeTsconfigFileGenerator } from './files/tsconfig-file-generator';

export async function createCliApp(name: string): Promise<void> {
  const rootDir = await getWorkspaceRoot();
  const directory = path.join(rootDir, 'apps', name);

  const namespace = await getNamespace(rootDir);
  const packageName = `${namespace}/${name}`;

  console.log(`🚀 Creating CLI App: ${packageName}`);

  const generator = new PackageGenerator(
    directory,
    makeAppPackageGenerator(packageName, namespace),
    [
      INDEX_FILE_GENERATOR,
      makeTsconfigFileGenerator('tsconfig.json', namespace),
      TSUP_FILE_GENERATOR,
      makePrettierConfigFileGenerator('prettier.config.mjs', namespace),
      makeEslintConfigGenerator('eslint.config.mjs', namespace),
      VITEST_CONFIG_FILE_GENERATOR,
    ],
  );

  await generator.generate();
}

function makeAppPackageGenerator(packageName: string, namespace: string) {
  const packageJsonModel = new PackageJSON({
    name: packageName,
    peerDependencies: [
      new Dependency('typescript', '^5.9.3'),
      new Dependency('@types/node', '^25.0.3'),
    ],
    dependencies: [new Dependency('commander', '14.0.2')],
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
