import path from 'path';

import { FileGenerator, PackageJsonGenerator } from '../../file-generator';
import { catalogDependency, Dependency, PackageJSON } from '../../package-json';
import { PackageGenerator } from '../../utils/package-generator';
import { getNamespace, getWorkspaceRoot } from '../../utils/workspace';
import { makeOxfmtConfigFileGenerator } from '../files/oxfmt-config-file-generator';
import { makeOxlintConfigGenerator } from '../files/oxlint-config-file-generator';
import { makeNodeTsconfigFileGenerator } from '../files/tsconfig-file-generator';
import { BOOK_SPEC_FILE_GENERATOR } from './files/book-spec-file-generator';
import { BOOK_TYPE_FILE_GENERATOR } from './files/book-type-file-generator';
import { BOOKS_FILE_GENERATOR } from './files/books-file-generator';
import { CONTEXT_FILE_GENERATOR } from './files/context-file-generator';
import { EXECUTE_OPERATION_FILE_GENERATOR } from './files/execute-operation-file-generator';
import { INDEX_FILE_GENERATOR } from './files/index-file-generator';
import { SCHEMA_BUILDER_FILE_GENERATOR } from './files/schema-builder-file-generator';
import { SCHEMA_INDEX_FILE_GENERATOR } from './files/schema-index-file-generator';
import { TSDOWN_FILE_GENERATOR } from './files/tsdown-file-generator';
import { VITEST_CONFIG_FILE_GENERATOR } from './files/vitest-config-file-generator';

export async function createGraphqlApp(name: string): Promise<void> {
  const rootDir = await getWorkspaceRoot();
  const directory = path.join(rootDir, 'apps', name);

  const namespace = await getNamespace(rootDir);
  const packageName = `${namespace}/${name}`;

  console.log(`◈ Creating GraphQL App: ${packageName}`);

  const generator = new PackageGenerator(
    directory,
    makeGraphqlAppFileGenerators(packageName, namespace),
  );

  await generator.generate();
}

export function makeGraphqlAppFileGenerators(
  packageName: string,
  namespace: string,
): ReadonlyArray<FileGenerator> {
  return [
    makeAppPackageGenerator(packageName, namespace),
    INDEX_FILE_GENERATOR,
    CONTEXT_FILE_GENERATOR,
    BOOKS_FILE_GENERATOR,
    SCHEMA_BUILDER_FILE_GENERATOR,
    SCHEMA_INDEX_FILE_GENERATOR,
    BOOK_TYPE_FILE_GENERATOR,
    EXECUTE_OPERATION_FILE_GENERATOR,
    BOOK_SPEC_FILE_GENERATOR,
    makeNodeTsconfigFileGenerator('tsconfig.json', namespace),
    TSDOWN_FILE_GENERATOR,
    makeOxfmtConfigFileGenerator('oxfmt.config.mts', namespace),
    makeOxlintConfigGenerator('.oxlintrc.json'),
    VITEST_CONFIG_FILE_GENERATOR,
  ];
}

function makeAppPackageGenerator(packageName: string, namespace: string) {
  const packageJsonModel = new PackageJSON({
    name: packageName,
    dependencies: [
      catalogDependency('graphql'),
      catalogDependency('graphql-yoga'),
      catalogDependency('@pothos/core'),
    ],
    devDependencies: [
      new Dependency(`${namespace}/oxlint-config`, 'workspace:*'),
      new Dependency(`${namespace}/oxfmt-config`, 'workspace:*'),
      new Dependency(`${namespace}/typescript-config`, 'workspace:*'),
      catalogDependency('@types/node'),
      catalogDependency('typescript'),
      catalogDependency('tsdown'),
      catalogDependency('tsx'),
      catalogDependency('oxlint'),
      catalogDependency('oxfmt'),
      catalogDependency('vitest'),
      catalogDependency('@vitest/coverage-v8'),
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
        format: 'oxfmt .',
        'format:check': 'oxfmt --check .',
        test: 'vitest run',
        'test:watch': 'vitest',
      },
    },
  });

  return new PackageJsonGenerator(packageJsonModel, namespace);
}
