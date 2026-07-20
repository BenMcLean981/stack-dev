import { FileGenerator } from './file-generator';
import { PackageJSON } from '../package-json';

export class PackageJsonGenerator implements FileGenerator {
  private readonly _packageJson: PackageJSON;
  private readonly _namespace: string;

  public constructor(
    packageJson: PackageJSON,
    namespace = ''
  ) {
    this._packageJson = packageJson;
    this._namespace = namespace;
  }

  public get filepath(): string {
    return 'package.json';
  }

  public async generate(): Promise<string> {
    return this._packageJson.format(this._namespace);
  }
}