import path from 'path';
import { FileGenerator, PackageJsonGenerator } from '../file-generator';
import { FileGeneratorImp } from '../file-generator/file-generator-imp';
import { catalogDependency, Dependency, PackageJSON } from '../package-json';
import { PackageGenerator } from '../utils/package-generator';

export async function makePrettierConfig(
  directory: string,
  namespace: string,
): Promise<PackageGenerator> {
  const fullPath = path.join(directory, 'configs/prettier-config');

  return new PackageGenerator(
    fullPath,
    makePrettierConfigFileGenerators(namespace),
  );
}

export function makePrettierConfigFileGenerators(
  namespace: string,
): ReadonlyArray<FileGenerator> {
  const packageJsonModel = new PackageJSON({
    name: `${namespace}/prettier-config`,
    peerDependencies: [new Dependency('prettier', '^3.6.2')],
    dependencies: [catalogDependency('prettier-plugin-organize-imports')],
    additionalData: {
      version: '0.1.0',
      private: true,
    },
  });

  return [
    new PackageJsonGenerator(packageJsonModel, namespace),
    BASE_FILE_GENERATOR,
  ];
}

const BASE = `/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  tabWidth: 2,
  singleQuote: true,
  plugins: [import.meta.resolve("prettier-plugin-organize-imports")],
};

export default config;
`;

const BASE_FILE_GENERATOR = new FileGeneratorImp('base.mjs', BASE);
