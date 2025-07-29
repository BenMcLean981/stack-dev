import path from 'path'
import { PackageJsonGenerator } from '../file-generator'
import { FileGeneratorImp } from '../file-generator/file-generator-imp'
import { PackageGenerator } from '../utils/package-generator'

export async function makeTypescriptConfig(
  directory: string,
  namespace: string
): Promise<PackageGenerator> {
  const PACKAGE_JSON = new PackageJsonGenerator(
    `${namespace}/typescript-config`,
    [{ name: 'typescript', version: '^5.8.3' }],
    [],
    {}
  )

  const fullPath = path.join(directory, 'configs/typescript-config')

  return new PackageGenerator(fullPath, PACKAGE_JSON, [BASE, REACT, NODE])
}

export const BASE = new FileGeneratorImp(
  'tsconfig.base.json',
  JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        strict: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        noEmit: true,
        types: [],
      },
    },
    null,
    2
  )
)

const REACT = new FileGeneratorImp(
  'tsconfig.react.json',
  JSON.stringify(
    {
      extends: './tsconfig.base.json',
      compilerOptions: {
        jsx: 'react-jsx',
        lib: ['DOM', 'DOM.Iterable', 'ES2022'],
        types: [],
      },
    },
    null,
    2
  )
)

const NODE = new FileGeneratorImp(
  'tsconfig.node.json',
  JSON.stringify(
    {
      extends: './tsconfig.base.json',
      compilerOptions: {
        lib: ['ES2022'],
        types: ['node'],
      },
    },
    null,
    2
  )
)
