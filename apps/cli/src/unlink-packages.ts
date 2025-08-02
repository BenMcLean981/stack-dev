import { getDirectoryPackageJson, getPackageJSONPath } from './utils/utils';

import fs from 'node:fs/promises';
import path from 'node:path';
import { TSConfig } from './tsconfig';
import { Package } from './utils/package';
import { getNamespace } from './utils/workspace';

export async function unlinkPackages(
  current: Package,
  target: Package,
): Promise<void> {
  await updatePackageJSON(current, target);
  await updateTSConfig(current, target);
}

async function updatePackageJSON(current: Package, target: Package) {
  const namespace = await getNamespace();

  const packageJSON = await getDirectoryPackageJson(current.directory);
  const updated = packageJSON
    .removeDependency(target.name)
    .removeDevDependency(target.name);

  const packageJSONPath = getPackageJSONPath(current.directory);

  await fs.writeFile(packageJSONPath, updated.format(namespace));
}

async function updateTSConfig(current: Package, target: Package) {
  const tsconfigPath = path.join(current.directory, 'tsconfig.json');
  const tsconfigContents = await fs.readFile(tsconfigPath, 'utf8');
  const tsconfig = TSConfig.parse(tsconfigContents);

  const updatedPaths = Object.fromEntries(
    Object.entries(tsconfig.compilerOptions.paths).filter(
      ([key]) => key !== target.name,
    ),
  );

  const updatedCompilerOptions =
    tsconfig.compilerOptions.setPaths(updatedPaths);

  const updated = tsconfig.setCompilerOptions(updatedCompilerOptions);

  await fs.writeFile(tsconfigPath, updated.format());
}
