import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(exec);

export type WorkingTreeStatus = 'clean' | 'dirty' | 'not-a-repository';

/**
 * Whether `root` is a git repository and whether anything is uncommitted.
 *
 * `stack migrate` rewrites files across the whole workspace, so a clean tree
 * is what makes `git diff` the review and `git checkout .` the undo. The three
 * outcomes are distinguished because the advice differs: a dirty tree needs a
 * commit, while a directory that was never a repository needs `git init`.
 */
export async function readWorkingTreeStatus(
  root: string,
): Promise<WorkingTreeStatus> {
  if (!(await isRepository(root))) {
    return 'not-a-repository';
  }

  const { stdout } = await run('git status --porcelain', { cwd: root });

  return stdout.trim() === '' ? 'clean' : 'dirty';
}

async function isRepository(root: string): Promise<boolean> {
  try {
    const { stdout } = await run('git rev-parse --is-inside-work-tree', {
      cwd: root,
    });

    return stdout.trim() === 'true';
  } catch {
    return false;
  }
}
