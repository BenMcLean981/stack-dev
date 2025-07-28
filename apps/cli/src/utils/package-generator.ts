import { FileGenerator } from "../file-generator/file-generator";
import { PackageJsonGenerator } from "../file-generator/package-json-generator";
import fs from "node:fs/promises";
import path from "node:path";

export class PackageGenerator {
  private readonly _root: string;

  private readonly _packageJson: PackageJsonGenerator;

  private readonly _fileGenerators: ReadonlyArray<FileGenerator>;

  public constructor(
    root: string,
    packageJson: PackageJsonGenerator,
    fileGenerators: ReadonlyArray<FileGenerator> = []
  ) {
    this._root = root;
    this._packageJson = packageJson;
    this._fileGenerators = fileGenerators;
  }

  public async generate(): Promise<void> {
    const all = [this._packageJson, ...this._fileGenerators];

    await fs.mkdir(this._root);

    await Promise.all(all.map((gen) => gen.generate()));
  }

  private async write(fileGenerator: FileGenerator): Promise<void> {
    const contents = await fileGenerator.generate();

    const filepath = path.join(this._root, fileGenerator.filepath);

    await fs.writeFile(filepath, contents);
  }
}
