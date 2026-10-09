import fs from 'node:fs/promises';
import path from 'node:path';

import { FileGenerator } from '../file-generator';
import { FileChange } from './file-change';

/** Writes a file from one of the generators `stack g` already uses. */
export class GeneratedFileChange implements FileChange {
  private readonly _filepath: string;

  private readonly _generator: FileGenerator;

  public constructor(filepath: string, generator: FileGenerator) {
    this._filepath = filepath;
    this._generator = generator;
  }

  public get filepath(): string {
    return this._filepath;
  }

  public describe(): string {
    return `write  ${this._filepath}`;
  }

  public async apply(root: string): Promise<void> {
    const full = path.join(root, this._filepath);

    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, await this._generator.generate());
  }
}
