import { Package } from '../utils/package';
import { FileChange } from './file-change';

export interface Migration {
  readonly name: string;

  /**
   * Inspects the workspace and returns the changes needed to bring it up to
   * date, or nothing when it is already current.
   *
   * Detection reads what is on disk rather than trusting a recorded version,
   * so a hand-edited workspace migrates correctly and re-running is a no-op.
   */
  detect(workspace: MigratingWorkspace): Promise<ReadonlyArray<FileChange>>;
}

export type MigratingWorkspace = {
  readonly root: string;

  readonly namespace: string;

  readonly packages: ReadonlyArray<Package>;
};
