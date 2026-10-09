import { exec } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { readWorkingTreeStatus } from '../working-tree';

const run = promisify(exec);

describe('readWorkingTreeStatus', () => {
  let root: string;

  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'stack-tree-'));
  });

  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true });
  });

  it('reports a directory that is not a repository', async () => {
    expect(await readWorkingTreeStatus(root)).toBe('not-a-repository');
  });

  it('reports a repository with nothing uncommitted', async () => {
    await commitSomething(root);

    expect(await readWorkingTreeStatus(root)).toBe('clean');
  });

  it('reports a repository with uncommitted changes', async () => {
    await commitSomething(root);
    await fs.writeFile(path.join(root, 'other.txt'), 'uncommitted');

    expect(await readWorkingTreeStatus(root)).toBe('dirty');
  });
});

async function commitSomething(root: string): Promise<void> {
  await run('git init -q', { cwd: root });
  await fs.writeFile(path.join(root, 'a.txt'), 'a');
  await run(
    'git -c user.email=t@example.com -c user.name=t add -A && ' +
      'git -c user.email=t@example.com -c user.name=t commit -qm first',
    { cwd: root },
  );
}
