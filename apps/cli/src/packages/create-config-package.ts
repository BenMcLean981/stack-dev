import { getNamespace, getWorkspaceRoot } from '../utils/utils';

import path from 'node:path';
import { PackageJsonGenerator } from '../file-generator';
import { PackageGenerator } from '../utils/package-generator';

export async function createConfigPackage(name: string): Promise<void> {
  const rootDir = await getWorkspaceRoot();
  const directory = path.join(rootDir, 'configs', name);

  const namespace = await getNamespace(rootDir);
  const packageName = `@${namespace}/${name}`;

  console.log(`✨ Creating config package: ${packageName}`);

  const generator = new PackageGenerator(
    directory,
    new PackageJsonGenerator(packageName),
    [],
  );

  await generator.generate();

  console.log(`✅ Config package created at: ${directory}`);
}
