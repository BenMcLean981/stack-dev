import { Dependency } from "./dependency";
import { FileGenerator } from "./file-generator";

export class PackageJsonGenerator implements FileGenerator {
  private readonly _filepath: string;

  private readonly _name: string;

  private readonly _dependencies: ReadonlyArray<Dependency>;

  private readonly _devDependencies: ReadonlyArray<Dependency>;

  // TODO: Snapshot
  private readonly _options: Record<string, string | ReadonlyArray<string>>;

  public constructor(
    filepath: string,
    name: string,
    dependencies: ReadonlyArray<Dependency>,
    devDependencies: ReadonlyArray<Dependency>,
    options: Record<string, string | ReadonlyArray<string>> = {}
  ) {
    this._filepath = filepath;
    this._name = name;
    this._dependencies = dependencies;
    this._devDependencies = devDependencies;

    this._options = options;
  }

  public get filepath(): string {
    return this._filepath;
  }

  public async generate(): Promise<string> {
    const dependencies: Record<string, string> = {};

    this._dependencies.forEach((dependency: Dependency) => {
      dependencies[dependency.name] = dependency.version;
    });

    const devDependencies: Record<string, string> = {};

    return JSON.stringify(
      {
        name: this._name,
        version: "0.1.0",
        private: true,
        dependencies: makeDependencyMap(this._dependencies),
        devDependencies: makeDependencyMap(this._devDependencies),
        ...this._options,
      },
      null,
      2
    );
  }
}

function makeDependencyMap(
  dependencies: ReadonlyArray<Dependency>
): Record<string, string> {
  const result: Record<string, string> = {};

  dependencies.forEach(
    (dependency: Dependency) => (result[dependency.name] = dependency.version)
  );

  return result;
}
