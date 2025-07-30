import { getDirectoryPackageJson, getPackageJSONPath } from './utils/utils';

import { Snapshot } from '@stack-dev/core';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Package } from './utils/package';

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

  if (development) {
    addDevelopmentDependency(packageJSON, target);
  } else {
    addDependency(packageJSON, target);
  }

  const packageJSONPath = getPackageJSONPath(current.directory);

  await fs.writeFile(packageJSONPath, JSON.stringify(packageJSON, null, 2));
}

function addDevelopmentDependency(packageJSON: Snapshot, target: Package) {
  if (packageJSON.devDependencies === undefined) {
    packageJSON.devDependencies = {};
  }

  packageJSON.devDependencies[target.name] = 'workspace:*';
}

function addDependency(packageJSON: Snapshot, target: Package) {
  if (packageJSON.dependencies === undefined) {
    packageJSON.dependencies = {};
  }

  packageJSON.dependencies[target.name] = 'workspace:*';
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
