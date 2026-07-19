import path from 'node:path';
import { PackageJSON } from '../package-json';
import { FileGenerator, PackageJsonGenerator } from '../file-generator';
import { PackageGenerator } from '../utils/package-generator';
import { getNamespace, getWorkspaceRoot } from '../utils/workspace';

export async function createConfigPackage(name: string): Promise<void> {
  const rootDir = await getWorkspaceRoot();
  const directory = path.join(rootDir, 'configs', name);

  const namespace = await getNamespace(rootDir);
  const packageName = `${namespace}/${name}`;

  const generator = new PackageGenerator(
    directory,
    makeConfigPackageFileGenerators(packageName, namespace),
  );

  await generator.generate();
}

export function makeConfigPackageFileGenerators(
  packageName: string,
  namespace: string,
): ReadonlyArray<FileGenerator> {
  const packageJsonModel = new PackageJSON({
    name: packageName,
    additionalData: {
      version: '0.1.0',
      private: true,
    },
  });

  return [new PackageJsonGenerator(packageJsonModel, namespace)];
}