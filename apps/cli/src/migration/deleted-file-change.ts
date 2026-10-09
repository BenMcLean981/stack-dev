import fs from 'node:fs/promises';
import path from 'node:path';

import { FileChange } from './file-change';

export class DeletedFileChange implements FileChange {
  private readonly _filepath: string;

  public constructor(filepath: string) {
    this._filepath = filepath;
  }

  public get filepath(): string {
    return this._filepath;
  }

  public describe(): string {
    return `delete ${this._filepath}`;
  }

  public async apply(root: string): Promise<void> {
    await fs.rm(path.join(root, this._filepath), {
      recursive: true,
      force: true,
    });
  }
}
