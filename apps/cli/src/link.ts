import { getDirectoryPackageJson, getPackageJSONPath } from './utils/utils';

import fs from 'node:fs/promises';
import path from 'node:path';
import { Dependency } from './utils/dependency';
import { Package } from './utils/package';
import { PackageJson } from './utils/package-json';

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
  const packageJSON = await getDirectoryPackageJson(current.directory);
  const updated = addDependency(packageJSON, target, development);

  const packageJSONPath = getPackageJSONPath(current.directory);

  await fs.writeFile(packageJSONPath, updated.format());
}

function addDependency(
  packageJSON: PackageJson,
  target: Package,
  development: boolean,
): PackageJson {
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
  const tsconfig = JSON.parse(tsconfigContents);

  if (tsconfig.compilerOptions === undefined) {
    tsconfig.compilerOptions = {};
  }

  if (tsconfig.compilerOptions.paths === undefined) {
    tsconfig.compilerOptions.paths = {};
  }

  const targetDirectory = path.join(target.directory, 'src', 'index.ts');

  tsconfig.compilerOptions.paths[target.name] = [
    path.relative(current.directory, targetDirectory),
  ];

  await fs.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
}
