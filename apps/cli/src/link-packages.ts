import { Dependency, PackageJSON } from './package-json';
import { getDirectoryPackageJson, getPackageJSONPath } from './utils/utils';

import fs from 'node:fs/promises';
import path from 'node:path';
import { TSConfig } from './tsconfig';
import { Package } from './utils/package';
import { getNamespace } from './utils/workspace';

export async function linkPackages(
  current: Package,
  target: Package,
  development: boolean,
): Promise<void> {
  await updatePackageJSON(current, target, development);
  await updateTSConfig(current, target);
}

async function updatePackageJSON(
  current: Package,
  target: Package,
  development: boolean,
) {
  const namespace = await getNamespace();

  const packageJSON = await getDirectoryPackageJson(current.directory);
  const updated = addDependency(packageJSON, target, development);

  const packageJSONPath = getPackageJSONPath(current.directory);

  await fs.writeFile(packageJSONPath, updated.format(namespace));
}

function addDependency(
  packageJSON: PackageJSON,
  target: Package,
  development: boolean,
): PackageJSON {
  const dependency = new Dependency(target.name, 'workspace:*');

  if (development) {
    return packageJSON.addDevDependency(dependency);
  } else {
    return packageJSON.addDependency(dependency);
  }
}

async function updateTSConfig(current: Package, target: Package) {
  const tsconfigPath = path.join(current.directory, 'tsconfig.json');
  const tsconfigContents = await fs.readFile(tsconfigPath, 'utf8');
  const tsconfig = TSConfig.parse(tsconfigContents);

  const targetDirectory = path.join(target.directory, 'src', 'index.ts');

  const updatedPaths = {
    ...tsconfig.compilerOptions.paths,
    [target.name]: [path.relative(current.directory, targetDirectory)],
  };
  const updatedCompilerOptions =
    tsconfig.compilerOptions.setPaths(updatedPaths);

  const updated = tsconfig.setCompilerOptions(updatedCompilerOptions);

  await fs.writeFile(tsconfigPath, updated.format());
}
