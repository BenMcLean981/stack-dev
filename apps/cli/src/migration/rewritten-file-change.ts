import fs from 'node:fs/promises';
import path from 'node:path';

import { FileChange } from './file-change';

/** Reads an existing file, maps its contents, and writes the result back. */
export class RewrittenFileChange implements FileChange {
  private readonly _filepath: string;

  private readonly _rewrite: (contents: string) => string;

  public constructor(filepath: string, rewrite: (contents: string) => string) {
    this._filepath = filepath;
    this._rewrite = rewrite;
  }

  public get filepath(): string {
    return this._filepath;
  }

  public describe(): string {
    return `rewrite ${this._filepath}`;
  }

  public async apply(root: string): Promise<void> {
    const full = path.join(root, this._filepath);

    const contents = await fs.readFile(full, { encoding: 'utf-8' });

    await fs.writeFile(full, this._rewrite(contents));
  }
}
