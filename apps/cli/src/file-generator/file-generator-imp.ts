import { FileGenerator } from './file-generator';

export class FileGeneratorImp implements FileGenerator {
  private readonly _filepath: string;

  private readonly _contents: string;

  public constructor(filepath: string, contents: string) {
    this._filepath = filepath;
    this._contents = contents;
  }

  public get filepath(): string {
    return this._filepath;
  }

  public async generate(): Promise<string> {
    return this._contents;
  }
}
