import { Snapshot } from '@stack-dev/core';
import glob from 'fast-glob';
import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'yaml';

export async function getNamespace(
  directory: string,
): Promise<string | undefined> {
  const root = await getWorkspaceRoot(directory);

  const packageJson = await fs.readFile(path.join(root, 'package.json'), {
    encoding: 'utf-8',
  });

  const result = JSON.parse(packageJson).name;

  if (!result) {
    throw new Error('Missing name.');
  }

  return result;
}

export async function getWorkspaceRoot(
  directory: string = process.cwd(),
): Promise<string> {
  const parent = path.dirname(directory);

  if (parent === directory) {
    throw new Error('Not a workspace.');
  }

  if (await isWorkspaceRoot(directory)) {
    return directory;
  }

  return getWorkspaceRoot(parent);
}

async function getPackageRoot(
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

export async function getCurrentPackage(
  directory: string = process.cwd(),
): Promise<string> {
  const packageRoot = await getPackageRoot(directory);
  const packageJson = await readPackageJson(packageRoot);

  return getCurrentPackage(packageJson.name);
}

export type Package = {
  name: string;

  directory: string;

  type: 'Config' | 'App' | 'Library' | 'Unknown';
};

export async function getPackageByName(name: string): Package {
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
  const workspaceFile = (await getWorkspaceFile(workspaceRoot)) as {
    packages: ReadonlyArray<string>;
  };

  const results: Array<Package> = [];

  for (const seg of workspaceFile.packages) {
    const packageType = getPackageType(seg);

    const packageJsonPaths = await glob(`${workspaceRoot}/${seg}/package.json`);

    const packageDirectories = packageJsonPaths.map((p) => path.dirname(p));

    for (const directory of packageDirectories) {
      const name = (await readPackageJson(directory)).name;

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

async function readPackageJson(directory: string): Promise<Snapshot> {
  const packageJsonPath = path.join(directory, 'package.json');
  const packageJsonText = await fs.readFile(packageJsonPath, {
    encoding: 'utf-8',
  });

  return JSON.parse(packageJsonText);
}

async function isWorkspaceRoot(directory: string): Promise<boolean> {
  return (
    (await fileExists(path.join(directory, 'pnpm-workspace.yaml'))) ||
    (await fileExists(path.join(directory, 'pnpm-workspace.yml')))
  );
}

async function getWorkspaceFile(directory: string): Snapshot {
  const case1 = path.join(directory, 'pnpm-workspace.yaml');
  const case2 = path.join(directory, 'pnpm-workspace.yml');

  if (await fileExists(case1)) {
    return yaml.parse(await fs.readFile(case1, { encoding: 'utf-8' }));
  } else if (await fileExists(case2)) {
    return yaml.parse(await fs.readFile(case2, { encoding: 'utf-8' }));
  } else {
    throw new Error(`Directory "${directory}" is not a workspace.`);
  }
}

async function isPackageRoot(directory: string): Promise<boolean> {
  return await fileExists(path.join(directory, 'package.json'));
}

async function fileExists(filepath: string): Promise<boolean> {
  try {
    await fs.access(filepath, fs.constants.F_OK);

    return true;
  } catch {
    return false;
  }
}
