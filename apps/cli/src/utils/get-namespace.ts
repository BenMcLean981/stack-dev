import fs from 'node:fs/promises';
import path from 'node:path';

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

async function isWorkspaceRoot(directory: string): Promise<boolean> {
  return (
    (await fileExists(path.join(directory, 'pnpm-workspace.yaml'))) ||
    (await fileExists(path.join(directory, 'pnpm-workspace.yml')))
  );
}

async function fileExists(filepath: string): Promise<boolean> {
  try {
    await fs.access(filepath, fs.constants.F_OK);

    return true;
  } catch {
    return false;
  }
}
