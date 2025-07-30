import { Snapshot } from '@stack-dev/core';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function getDirectoryPackageJson(
  directory: string,
): Promise<Snapshot> {
  const packageJsonPath = getPackageJSONPath(directory);
  const packageJsonText = await fs.readFile(packageJsonPath, {
    encoding: 'utf-8',
  });

  return JSON.parse(packageJsonText);
}

export function getPackageJSONPath(directory: string) {
  return path.join(directory, 'package.json');
}

export async function fileExists(filepath: string): Promise<boolean> {
  try {
    await fs.access(filepath, fs.constants.F_OK);

    return true;
  } catch {
    return false;
  }
}
