import { Snapshot } from '@stack-dev/core';
import { Dependency } from '../package-json';
import { FileGenerator } from './file-generator';

export class PackageJsonGenerator implements FileGenerator {
  private readonly _name: string;

  private readonly _dependencies: ReadonlyArray<Dependency>;

  private readonly _devDependencies: ReadonlyArray<Dependency>;

  private readonly _options: Snapshot;

  // TODO: Change to take a PackageJSON
  public constructor(
    name: string,
    dependencies: ReadonlyArray<Dependency> = [],
    devDependencies: ReadonlyArray<Dependency> = [],
    options: Snapshot = {},
  ) {
    this._name = name;
    this._dependencies = dependencies;
    this._devDependencies = devDependencies;

    this._options = options;
  }

  public get filepath(): string {
    return 'package.json';
  }

  public async generate(): Promise<string> {
    return JSON.stringify(
      {
        name: this._name,
        version: '0.1.0',
        private: true,
        dependencies: makeDependencyMap(this._dependencies),
        devDependencies: makeDependencyMap(this._devDependencies),
        ...this._options,
      },
      null,
      2,
    );
  }
}

function makeDependencyMap(
  dependencies: ReadonlyArray<Dependency>,
): Record<string, string> {
  const result: Record<string, string> = {};

  dependencies.forEach(
    (dependency: Dependency) => (result[dependency.name] = dependency.version),
  );

  return result;
}
