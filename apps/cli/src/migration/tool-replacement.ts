import path from 'node:path';

import { FileGenerator } from '../file-generator';
import { Dependency, PackageJSON } from '../package-json';
import { fileExists, getDirectoryPackageJson } from '../utils/utils';
import { DeletedFileChange } from './deleted-file-change';
import { FileChange } from './file-change';
import { GeneratedFileChange } from './generated-file-change';
import { isLegacyConfigPackage } from './legacy-config-packages';
import { MigratingWorkspace } from './migration';
import { makePackageJsonRewrite } from './package-json-rewrite';

/**
 * Describes swapping one tool for another inside a single package: drop the
 * old config file and dependencies, write the new config, and update scripts.
 */
export type ToolReplacement = {
  /** Config file the old tool used, deleted when present. */
  readonly legacyConfig: string;

  /** Config file the new tool uses. */
  readonly config: string;

  readonly isLegacyDependency: (name: string, namespace: string) => boolean;

  readonly makeConfigGenerator: (
    packageJson: PackageJSON,
    namespace: string,
  ) => FileGenerator;

  readonly makeDependencies: (namespace: string) => ReadonlyArray<Dependency>;

  readonly scripts: Readonly<Record<string, string | undefined>>;
};

export async function detectToolReplacement(
  workspace: MigratingWorkspace,
  directory: string,
  replacement: ToolReplacement,
): Promise<ReadonlyArray<FileChange>> {
  const relative = path.relative(workspace.root, directory);

  const hasLegacyConfig = await fileExists(
    path.join(directory, replacement.legacyConfig),
  );

  const packageJson = await getDirectoryPackageJson(directory);

  // A package that is itself being replaced is not migrated in place.
  if (isLegacyConfigPackage(packageJson.name, workspace.namespace)) {
    return [];
  }

  const stale = [...packageJson.devDependencies].filter((d) =>
    replacement.isLegacyDependency(d.name, workspace.namespace),
  );

  if (!hasLegacyConfig && stale.length === 0) {
    return [];
  }

  return [
    ...(hasLegacyConfig
      ? [new DeletedFileChange(path.join(relative, replacement.legacyConfig))]
      : []),
    new GeneratedFileChange(
      path.join(relative, replacement.config),
      replacement.makeConfigGenerator(packageJson, workspace.namespace),
    ),
    makePackageJsonRewrite(relative, workspace.namespace, {
      removeDevDependencies: stale.map((d) => d.name),
      addDevDependencies: replacement.makeDependencies(workspace.namespace),
      scripts: replacement.scripts,
    }),
  ];
}

export function isReactPackage(packageJson: PackageJSON): boolean {
  return [...packageJson.dependencies, ...packageJson.devDependencies].some(
    (d) => d.name === 'react',
  );
}
