import path from 'path';
import { FileGenerator, PackageJsonGenerator } from '../file-generator';
import { FileGeneratorImp } from '../file-generator/file-generator-imp';
import { catalogDependency, PackageJSON } from '../package-json';
import { PackageGenerator } from '../utils/package-generator';

export async function makeOxlintConfig(
  directory: string,
  namespace: string,
): Promise<PackageGenerator> {
  const fullPath = path.join(directory, 'configs/oxlint-config');

  return new PackageGenerator(
    fullPath,
    makeOxlintConfigFileGenerators(namespace),
  );
}

export function makeOxlintConfigFileGenerators(
  namespace: string,
): ReadonlyArray<FileGenerator> {
  const packageJsonModel = new PackageJSON({
    name: `${namespace}/oxlint-config`,
    devDependencies: [catalogDependency('oxlint')],
    additionalData: {
      version: '0.1.0',
      private: true,
      files: ['*.oxlintrc.json'],
    },
  });

  return [
    new PackageJsonGenerator(packageJsonModel, namespace),
    BASE_FILE_GENERATOR,
    REACT_FILE_GENERATOR,
  ];
}

const BASE = `{
  "plugins": ["typescript", "unicorn", "oxc"],
  "categories": {
    "correctness": "error"
  },
  "rules": {
    "typescript/array-type": ["error", { "default": "generic" }],
    "typescript/consistent-type-definitions": "off",
    "typescript/class-literal-property-style": ["error", "getters"]
  }
}
`;

const BASE_FILE_GENERATOR = new FileGeneratorImp('base.oxlintrc.json', BASE);

const REACT = `{
  "plugins": ["typescript", "unicorn", "oxc", "react"],
  "categories": {
    "correctness": "error"
  }
}
`;

const REACT_FILE_GENERATOR = new FileGeneratorImp('react.oxlintrc.json', REACT);
