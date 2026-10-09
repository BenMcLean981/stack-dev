import { getAllPackages } from '../utils/package';
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
  return {
    root,
    namespace: await getNamespace(root),
    packages: await getAllPackages(root),
  };
}
