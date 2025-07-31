import { Equalable, haveSameItems } from '@stack-dev/core';

import { Snapshot } from '@stack-dev/core';
import JSON5 from 'json5';
import { isEqual } from 'lodash';
import { Dependency } from './dependency';

export type ConstructorArgs = {
  name: string;
  dependencies?: ReadonlyArray<Dependency>;
  devDependencies?: ReadonlyArray<Dependency>;
  workspaces?: ReadonlyArray<string>;
  additionalData?: Snapshot;
};

export class PackageJson implements Equalable {
  private readonly _name: string;

  private readonly _dependencies: ReadonlyArray<Dependency>;

  private readonly _devDependencies: ReadonlyArray<Dependency>;

  private readonly _workspaces: ReadonlyArray<string>;

  private readonly _additionalData: Snapshot;

  public constructor(args: ConstructorArgs) {
    this._name = args.name;
    this._dependencies = args.dependencies ?? [];
    this._devDependencies = args.devDependencies ?? [];
    this._workspaces = args.workspaces ?? [];
    this._additionalData = args.additionalData ?? {};
  }

  public get name(): string {
    return this._name;
  }

  public get dependencies(): ReadonlyArray<Dependency> {
    return this._dependencies;
  }

  public get devDependencies(): ReadonlyArray<Dependency> {
    return this._devDependencies;
  }

  public get workspaces(): ReadonlyArray<string> {
    return this._workspaces;
  }

  public addDependency(dependency: Dependency): PackageJson {
    return new PackageJson({
      name: this.name,
      dependencies: [...this.dependencies, dependency],
      devDependencies: this.devDependencies,
      workspaces: this.workspaces,
      additionalData: this._additionalData,
    });
  }

  public addDevDependency(dependency: Dependency): PackageJson {
    return new PackageJson({
      name: this.name,
      dependencies: this.dependencies,
      devDependencies: [...this.devDependencies, dependency],
      workspaces: this.workspaces,
      additionalData: this._additionalData,
    });
  }

  public static parse(s: string): PackageJson {
    const json = JSON5.parse(s);

    const name = json.name;
    const dependencies = Object.entries(json.dependencies).map(
      ([name, version]) => new Dependency(name, version as string),
    );

    const devDependencies = Object.entries(json.devDependencies).map(
      ([name, version]) => new Dependency(name, version as string),
    );

    const workspaces = json.workspaces as ReadonlyArray<string>;

    const additionalData = { ...json };
    delete additionalData['name'];
    delete additionalData['dependencies'];
    delete additionalData['devDependencies'];
    delete additionalData['workspaces'];

    return new PackageJson({
      name,
      dependencies,
      devDependencies,
      workspaces,
      additionalData,
    });
  }

  public format(): string {
    const json = {
      name: this._name,
      dependencies: makeDependencyObject(this._dependencies),
      devDependencies: makeDependencyObject(this._devDependencies),
      workspaces: this._workspaces,
      ...this._additionalData,
    };

    return JSON5.stringify(json);
  }

  public equals(other: unknown): boolean {
    if (other instanceof PackageJson) {
      const sameDependencies = haveSameItems(
        this._dependencies,
        other._dependencies,
        (d1, d2) => d1.equals(d2),
      );

      const sameDevDependencies = haveSameItems(
        this._devDependencies,
        other._devDependencies,
        (d1, d2) => d1.equals(d2),
      );

      const sameWorkspaces = haveSameItems(this._workspaces, other._workspaces);

      return (
        this._name === other._name &&
        sameDependencies &&
        sameDevDependencies &&
        sameWorkspaces &&
        isEqual(this._additionalData, other._additionalData)
      );
    } else {
      return false;
    }
  }
}

function makeDependencyObject(
  dependencies: ReadonlyArray<Dependency>,
): Record<string, string> {
  const result: Record<string, string> = {};

  dependencies.forEach((d) => (result[d.name] = d.version));

  return result;
}
