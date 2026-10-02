import fs from 'node:fs/promises';
import path from 'node:path';

import JSON5 from 'json5';

import { makeCatalogYaml } from '../package-json';
import { FileChange } from './file-change';
import { MigratingWorkspace, Migration } from './migration';
import { RewrittenFileChange } from './rewritten-file-change';

const WORKSPACE_YAML = 'pnpm-workspace.yaml';

const TURBO_JSON = 'turbo.json';

/** Tasks the migrated packages define that turbo needs to know about. */
const REQUIRED_TASKS: Readonly<Record<string, unknown>> = {
  format: { cache: false },
  'format:check': {},
};

/**
 * Brings the workspace root up to date: the catalog gains the current tool
 * versions, and turbo learns the tasks the migrated packages now define.
 *
 * Both files are edited rather than regenerated, because a real workspace has
 * custom tasks and extra keys that a migration must not discard.
 */
export class WorkspaceFileMigration implements Migration {
  public get name(): string {
    return 'workspace root';
  }

  public async detect(
    workspace: MigratingWorkspace,
  ): Promise<ReadonlyArray<FileChange>> {
    return [
      ...(await this.detectCatalog(workspace)),
      ...(await this.detectTurbo(workspace)),
    ];
  }

  private async detectCatalog(
    workspace: MigratingWorkspace,
  ): Promise<ReadonlyArray<FileChange>> {
    const current = await readOrEmpty(
      path.join(workspace.root, WORKSPACE_YAML),
    );

    if (current.includes(makeCatalogYaml())) {
      return [];
    }

    return [new RewrittenFileChange(WORKSPACE_YAML, replaceCatalog)];
  }

  private async detectTurbo(
    workspace: MigratingWorkspace,
  ): Promise<ReadonlyArray<FileChange>> {
    const current = await readOrEmpty(path.join(workspace.root, TURBO_JSON));

    if (current === '' || hasRequiredTasks(current)) {
      return [];
    }

    return [new RewrittenFileChange(TURBO_JSON, addRequiredTasks)];
  }
}

/**
 * Replaces the `catalog:` block, leaving the `packages:` globs and anything
 * else above it untouched.
 */
function replaceCatalog(contents: string): string {
  const index = contents.indexOf('catalog:');

  const head =
    index === -1 ? contents.trimEnd() : contents.slice(0, index).trimEnd();

  return `${head}\n\n${makeCatalogYaml()}\n`;
}

function hasRequiredTasks(contents: string): boolean {
  const tasks = JSON5.parse(contents).tasks ?? {};

  return Object.keys(REQUIRED_TASKS).every((name) => name in tasks);
}

function addRequiredTasks(contents: string): string {
  const turbo = JSON5.parse(contents);

  const merged = {
    ...turbo,
    tasks: { ...REQUIRED_TASKS, ...turbo.tasks },
  };

  return `${JSON.stringify(merged, null, 2)}\n`;
}

async function readOrEmpty(filepath: string): Promise<string> {
  try {
    return await fs.readFile(filepath, { encoding: 'utf-8' });
  } catch {
    return '';
  }
}
