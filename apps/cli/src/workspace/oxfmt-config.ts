import path from 'path';

import { FileGenerator, PackageJsonGenerator } from '../file-generator';
import { FileGeneratorImp } from '../file-generator/file-generator-imp';
import { catalogDependency, PackageJSON } from '../package-json';
import { PackageGenerator } from '../utils/package-generator';

export async function makeOxfmtConfig(
  directory: string,
  namespace: string,
): Promise<PackageGenerator> {
  const fullPath = path.join(directory, 'configs/oxfmt-config');

  return new PackageGenerator(
    fullPath,
    makeOxfmtConfigFileGenerators(namespace),
  );
}

export function makeOxfmtConfigFileGenerators(
  namespace: string,
): ReadonlyArray<FileGenerator> {
  const packageJsonModel = new PackageJSON({
    name: `${namespace}/oxfmt-config`,
    devDependencies: [catalogDependency('oxfmt')],
    additionalData: {
      version: '0.1.0',
      private: true,
      type: 'module',
      exports: {
        './base': './base.ts',
        './react': './react.ts',
      },
      files: ['*.ts'],
    },
  });

  return [
    new PackageJsonGenerator(packageJsonModel, namespace),
    BASE_FILE_GENERATOR,
    REACT_FILE_GENERATOR,
  ];
}

const BASE = `import { defineConfig } from 'oxfmt';

/**
 * @see https://oxc.rs/docs/guide/usage/formatter
 */
export default defineConfig({
  tabWidth: 2,
  printWidth: 80,
  singleQuote: true,
  sortImports: true,
  // The CLI owns package.json key and dependency ordering (see
  // PackageJSON.format), so the formatter must not re-sort it.
  sortPackageJson: false,
  ignorePatterns: ['**/__snapshots__/**', '**/dist/**', '**/coverage/**'],
});
`;

const BASE_FILE_GENERATOR = new FileGeneratorImp('base.ts', BASE);

const REACT = `import { defineConfig } from 'oxfmt';

import base from './base.ts';

export default defineConfig({
  ...base,
  jsxSingleQuote: true,
});
`;

const REACT_FILE_GENERATOR = new FileGeneratorImp('react.ts', REACT);
