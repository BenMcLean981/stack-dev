import { getAllPackages, Package } from '../utils/package';
import { getNamespace } from '../utils/workspace';
import { CatalogDependencyMigration } from './catalog-dependency-migration';
import { ConfigPackageMigration } from './config-package-migration';
import { EslintToOxlintMigration } from './eslint-to-oxlint-migration';
import { FileChange } from './file-change';
import { MigratingWorkspace, Migration } from './migration';
import { PrettierToOxfmtMigration } from './prettier-to-oxfmt-migration';
import { TsupToTsdownMigration } from './tsup-to-tsdown-migration';
import { WorkspaceFileMigration } from './workspace-file-migration';

export async function planMigration(
  root: string,
): Promise<ReadonlyArray<FileChange>> {
  const workspace = await readWorkspace(root);

  const detected = await Promise.all(
    MIGRATIONS.map((m) => m.detect(workspace)),
  );

  return detected.flat();
}

export async function applyMigration(
  root: string,
  changes: ReadonlyArray<FileChange>,
): Promise<void> {
  for (const change of changes) {
    await change.apply(root);
  }
}

const MIGRATIONS: ReadonlyArray<Migration> = [
  new EslintToOxlintMigration(),
  new PrettierToOxfmtMigration(),
  new TsupToTsdownMigration(),
  new CatalogDependencyMigration(),
  new ConfigPackageMigration(),
  new WorkspaceFileMigration(),
];

async function readWorkspace(root: string): Promise<MigratingWorkspace> {
  const namespace = await getNamespace(root);
  const packages = await getAllPackages(root);

  validateCreatedByStack(root, namespace, packages);

  return { root, namespace, packages };
}

/**
 * A migration rewrites every package.json in the workspace, so it has to be
 * sure the workspace is one this CLI created. The signature is a namespaced
 * shared config package, which `stack create` always generates and nothing
 * else would have.
 */
function validateCreatedByStack(
  root: string,
  namespace: string,
  packages: ReadonlyArray<Package>,
): void {
  const hasConfigPackage = packages.some(
    (p) => p.name.startsWith(`${namespace}/`) && p.name.endsWith('-config'),
  );

  if (!hasConfigPackage) {
    throw new Error(
      `"${root}" does not look like a workspace created by stack: ` +
        `no "${namespace}/*-config" package found. Refusing to migrate, ` +
        'because migrating rewrites every package.json in the workspace.',
    );
  }
}
