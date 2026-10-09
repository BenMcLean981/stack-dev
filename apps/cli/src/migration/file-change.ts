export interface FileChange {
  /** Path to the affected file, relative to the workspace root. */
  readonly filepath: string;

  /** One line describing the change, for `--dry-run` output. */
  describe(): string;

  apply(root: string): Promise<void>;
}
