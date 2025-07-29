import fs from 'fs/promises';
import path from 'path';
import { getNamespace } from '../utils/get-namespace';
import { makeRootPackage } from './root-package';
import { makeTypescriptConfig } from './typescript-config';

export async function createWorkspace(name: string, directory: string) {
  await validateNotInWorkspace(directory);

  console.log(`✨ Creating workspace: @${name}`);

  const fullPath = path.join(directory, name);

  await fs.mkdir(fullPath, { recursive: true });

  const namespace = `@${name}`;
  const PACKAGES = [
    await makeRootPackage(fullPath, name),
    await makeTypescriptConfig(fullPath, namespace),
  ];

  await Promise.all(PACKAGES.map((p) => p.generate()));

  await fs.mkdir(path.join(fullPath, 'apps'));
  await fs.mkdir(path.join(fullPath, 'configs'));
  await fs.mkdir(path.join(fullPath, 'packages'));

  console.log(`✅ Workspace created at: ${fullPath}`);
  console.log('');
  console.log(`Run "cd ${fullPath}" followed by "pnpm install"`);
}

async function validateNotInWorkspace(directory: string): Promise<void> {
  const namespace = await getNamespace(directory);

  if (namespace !== undefined) {
    throw new Error(`Currently in workspace "${namespace}".`);
  }
}
