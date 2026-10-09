import path from 'node:path';

import {
  CATALOG,
  CATALOG_VERSION,
  Dependency,
  PackageJSON,
} from '../package-json';
import { getDirectoryPackageJson } from '../utils/utils';
import { FileChange } from './file-change';
import { isLegacyConfigPackage } from './legacy-config-packages';
import { MigratingWorkspace, Migration } from './migration';
import { RewrittenFileChange } from './rewritten-file-change';

/**
 * Points every dependency the workspace catalog carries at `catalog:`, so one
 * version governs the whole workspace.
 *
 * This is also what moves a workspace onto TypeScript 7: a package pinning
 * `typescript@^5` — in any dependency section — picks up the catalog's 7.x.
 */
export class CatalogDependencyMigration implements Migration {
  public get name(): string {
    return 'dependencies -> catalog';
  }

  public async detect(
    workspace: MigratingWorkspace,
  ): Promise<ReadonlyArray<FileChange>> {
    const perPackage = await Promise.all(
      workspace.packages.map((p) =>
        this.detectInPackage(workspace, p.directory),
      ),
    );

    return perPackage.flat();
  }

  private async detectInPackage(
    workspace: MigratingWorkspace,
    directory: string,
  ): Promise<ReadonlyArray<FileChange>> {
    const packageJson = await getDirectoryPackageJson(directory);

    if (isLegacyConfigPackage(packageJson.name, workspace.namespace)) {
      return [];
    }

    if (countMisalignedDependencies(packageJson) === 0) {
      return [];
    }

    return [
      new RewrittenFileChange(
        path.join(path.relative(workspace.root, directory), 'package.json'),
        (contents) =>
          alignToCatalog(PackageJSON.parse(contents)).format(
            workspace.namespace,
          ),
      ),
    ];
  }
}

function countMisalignedDependencies(packageJson: PackageJSON): number {
  return [
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies,
  ].filter(isMisaligned).length;
}

function alignToCatalog(packageJson: PackageJSON): PackageJSON {
  const withDependencies = packageJson.dependencies
    .filter(isMisaligned)
    .reduce(
      (acc, d) => acc.removeDependency(d.name).addDependency(toCatalog(d)),
      packageJson,
    );

  const withDevDependencies = withDependencies.devDependencies
    .filter(isMisaligned)
    .reduce(
      (acc, d) =>
        acc.removeDevDependency(d.name).addDevDependency(toCatalog(d)),
      withDependencies,
    );

  return withDevDependencies.peerDependencies
    .filter(isMisaligned)
    .reduce(
      (acc, d) =>
        acc.removePeerDependency(d.name).addPeerDependency(toCatalog(d)),
      withDevDependencies,
    );
}

function isMisaligned(dependency: Dependency): boolean {
  return dependency.name in CATALOG && dependency.version !== CATALOG_VERSION;
}

function toCatalog(dependency: Dependency): Dependency {
  return new Dependency(dependency.name, CATALOG_VERSION);
}
