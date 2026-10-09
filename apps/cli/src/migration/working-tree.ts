import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(exec);

/**
 * Whether `root` is a git repository with no uncommitted changes.
 *
 * `stack migrate` rewrites files across the whole workspace, so a clean tree
 * is what makes `git diff` the review tool and `git checkout .` the undo.
 * A directory that is not a repository at all counts as not clean.
 */
export async function isWorkingTreeClean(root: string): Promise<boolean> {
  try {
    const { stdout } = await run('git status --porcelain', { cwd: root });

    return stdout.trim() === '';
  } catch {
    return false;
  }
}
