import path from 'path';
import { FileGenerator, PackageJsonGenerator } from '../file-generator';
import { FileGeneratorImp } from '../file-generator/file-generator-imp';
import { Dependency, PackageJSON } from '../package-json';
import { PackageGenerator } from '../utils/package-generator';

export async function makeEslintConfig(
  directory: string,
  namespace: string,
): Promise<PackageGenerator> {
  const fullPath = path.join(directory, 'configs/eslint-config');

  return new PackageGenerator(
    fullPath,
    makeEslintConfigFileGenerators(namespace),
  );
}

export function makeEslintConfigFileGenerators(
  namespace: string,
): ReadonlyArray<FileGenerator> {
  const packageJsonModel = new PackageJSON({
    name: `${namespace}/eslint-config`,
    peerDependencies: [
      new Dependency('eslint', '^9.32.0'),
      new Dependency('typescript', '^5.8.3'),
    ],
    dependencies: [
      new Dependency('@eslint/js', '^9.32.0'),
      new Dependency('eslint-plugin-react', '^7.37.5'),
      new Dependency('typescript-eslint', '^8.38.0'),
    ],
    additionalData: {
      version: '0.1.0',
      private: true,
    },
  });

  return [
    new PackageJsonGenerator(packageJsonModel, namespace),
    BASE_FILE_GENERATOR,
    REACT_FILE_GENERATOR,
  ];
}

const BASE = `import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    rules: {
      "@typescript-eslint/array-type": ["error", { default: "generic" }],
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/class-literal-property-style": ["error", "getters"],
    },
  }
);
`;

const BASE_FILE_GENERATOR = new FileGeneratorImp('base.mjs', BASE);

const REACT = `import eslint from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  }
);
`;

const REACT_FILE_GENERATOR = new FileGeneratorImp('react.mjs', REACT);
