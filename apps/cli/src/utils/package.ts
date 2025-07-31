import { fileExists, getDirectoryPackageJson } from './utils';
import { getDirectoryWorkspaceFile, getWorkspaceRoot } from './workspace';

import { glob } from 'fast-glob';
import path from 'node:path';

// TODO: make into class with PackageJSON.
export type Package = {
  name: string;

  directory: string;

  type: 'Config' | 'App' | 'Library' | 'Unknown';
};

export async function getCurrentPackage(
  directory: string = process.cwd(),
): Promise<Package> {
  const packageRoot = await getPackageRoot(directory);
  const packageJson = await getDirectoryPackageJson(packageRoot);

  return getPackageByName(packageJson.name);
}

export async function getPackageRoot(
  directory: string = process.cwd(),
): Promise<string> {
  const parent = path.dirname(directory);

  if (parent === directory) {
    throw new Error('Not a package.');
  }

  if (await isPackageRoot(directory)) {
    return directory;
  }

  return getPackageRoot(parent);
}

export async function getPackageByName(name: string): Promise<Package> {
  const all = await getAllPackages();

  const match = all.find((p) => p.name === name);

  if (match === undefined) {
    throw new Error(`No package with name "${name}".`);
  }

  return match;
}

export async function getAllPackages(
  directory: string = process.cwd(),
): Promise<ReadonlyArray<Package>> {
  const workspaceRoot = await getWorkspaceRoot(directory);
  const workspaceFile = (await getDirectoryWorkspaceFile(workspaceRoot)) as {
    packages: ReadonlyArray<string>;
  };

  const results: Array<Package> = [];

  for (const seg of workspaceFile.packages) {
    const packageType = getPackageType(seg);

    const packageJsonPaths = await glob(`${workspaceRoot}/${seg}/package.json`);

    const packageDirectories = packageJsonPaths.map((p) => path.dirname(p));

    for (const directory of packageDirectories) {
      const name = (await getDirectoryPackageJson(directory)).name;

      results.push({
        name,
        directory,
        type: packageType,
      });
    }
  }

  return results;
}

function getPackageType(segment: string): Package['type'] {
  if (segment.startsWith('app')) {
    return 'App';
  } else if (segment.startsWith('config')) {
    return 'Config';
  } else if (segment.startsWith('package') || segment.startsWith('lib')) {
    return 'Library';
  } else {
    return 'Unknown';
  }
}

export function comparePackages(a: Package, b: Package): number {
  const packageTypeDifference = comparePackageTypes(a.type, b.type);

  if (packageTypeDifference !== 0) {
    return packageTypeDifference;
  } else {
    return a.name.localeCompare(b.name);
  }
}

function comparePackageTypes(a: Package['type'], b: Package['type']): number {
  return getPackageTypeIndex(a) - getPackageTypeIndex(b);
}

function getPackageTypeIndex(packageType: Package['type']): number {
  switch (packageType) {
    case 'Library':
      return 0;
    case 'Config':
      return 1;
    case 'App':
      return 2;
    case 'Unknown':
      return 3;
  }
}

async function isPackageRoot(directory: string): Promise<boolean> {
  return await fileExists(path.join(directory, 'package.json'));
}
