import fs from 'node:fs/promises';
import path from 'node:path';
import { PackageJSON } from '../package-json/package-json';

export async function getDirectoryPackageJson(
  directory: string,
): Promise<PackageJSON> {
  const packageJsonPath = getPackageJSONPath(directory);
  const packageJsonText = await fs.readFile(packageJsonPath, {
    encoding: 'utf-8',
  });

  return PackageJSON.parse(packageJsonText);
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
