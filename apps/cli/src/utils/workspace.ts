import { fileExists, getDirectoryPackageJson } from './utils';

import { Snapshot } from '@stack-dev/core';
import fs from 'node:fs/promises';
import path from 'path';
import yaml from 'yaml';

export type WorkspaceYaml = {
  packages: ReadonlyArray<string>;
};

export async function getDirectoryWorkspaceFile(
  directory: string,
): Promise<WorkspaceYaml> {
  const raw = await getRawDirectoryWorkspaceFile(directory);

  if ('packages' in raw && raw.packages instanceof Array) {
    return {
      packages: raw.packages.filter((p): p is string => typeof p === 'string'),
    };
  } else {
    return { packages: [] };
  }
}

async function getRawDirectoryWorkspaceFile(
  directory: string,
): Promise<Snapshot> {
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

export async function isWorkspaceRoot(directory: string): Promise<boolean> {
  return (
    (await fileExists(path.join(directory, 'pnpm-workspace.yaml'))) ||
    (await fileExists(path.join(directory, 'pnpm-workspace.yml')))
  );
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

export async function getNamespace(
  directory: string = process.cwd(),
): Promise<string> {
  const root = await getWorkspaceRoot(directory);

  const packageJson = await getDirectoryPackageJson(root);

  const result = packageJson.name;

  if (!result) {
    throw new Error('Missing name.');
  }

  return `@${result}`;
}
