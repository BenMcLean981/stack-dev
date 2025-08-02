import { Equalable, haveSameItems, sortKeys } from '@stack-dev/core';

import { Snapshot } from '@stack-dev/core';
import JSON5 from 'json5';
import { isEqual } from 'lodash';
import { Dependency } from './dependency';

export type ConstructorArgs = {
  name: string;
  dependencies?: ReadonlyArray<Dependency>;
  devDependencies?: ReadonlyArray<Dependency>;
  additionalData?: Snapshot;
};

export class PackageJSON implements Equalable {
  private readonly _name: string;

  private readonly _dependencies: ReadonlyArray<Dependency>;

  private readonly _devDependencies: ReadonlyArray<Dependency>;

  private readonly _additionalData: Snapshot;

  public constructor(args: ConstructorArgs) {
    this._name = args.name;
    this._dependencies = args.dependencies ?? [];
    this._devDependencies = args.devDependencies ?? [];
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

  public addDependency(dependency: Dependency): PackageJSON {
    return new PackageJSON({
      name: this.name,
      dependencies: [...this.dependencies, dependency],
      devDependencies: this.devDependencies,
      additionalData: this._additionalData,
    });
  }

  public addDevDependency(dependency: Dependency): PackageJSON {
    return new PackageJSON({
      name: this.name,
      dependencies: this.dependencies,
      devDependencies: [...this.devDependencies, dependency],
      additionalData: this._additionalData,
    });
  }

  public removeDependency(name: string): PackageJSON {
    return new PackageJSON({
      name: this.name,
      dependencies: this.dependencies.filter((d) => d.name !== name),
      devDependencies: this.devDependencies,
      additionalData: this._additionalData,
    });
  }

  public removeDevDependency(name: string): PackageJSON {
    return new PackageJSON({
      name: this.name,
      dependencies: this.dependencies,
      devDependencies: this.devDependencies.filter((d) => d.name !== name),
      additionalData: this._additionalData,
    });
  }

  public static parse(s: string): PackageJSON {
    const json = JSON5.parse(s);

    const name = json.name;
    const dependencies = PackageJSON.parseDependencies(json);
    const devDependencies = PackageJSON.parseDevDependencies(json);

    const additionalData = { ...json };
    delete additionalData['name'];
    delete additionalData['dependencies'];
    delete additionalData['devDependencies'];

    return new PackageJSON({
      name,
      dependencies,
      devDependencies,
      additionalData,
    });
  }

  private static parseDependencies(json: Snapshot) {
    if ('dependencies' in json && typeof json.dependencies === 'object') {
      return Object.entries(json.dependencies).map(
        ([name, version]) => new Dependency(name, version as string),
      );
    } else {
      return [];
    }
  }

  private static parseDevDependencies(json: Snapshot) {
    if ('devDependencies' in json && typeof json.devDependencies === 'object') {
      return Object.entries(json.devDependencies).map(
        ([name, version]) => new Dependency(name, version as string),
      );
    } else {
      return [];
    }
  }

  public format(namespace: string): string {
    const json = {
      name: this._name,
      dependencies: makeDependencyObject(this._dependencies, namespace),
      devDependencies: makeDependencyObject(this._devDependencies, namespace),
      ...this._additionalData,
    };

    const orederd = sortKeys(json, comparePackageJSONKeys);

    return JSON.stringify(orederd, null, 2);
  }

  public equals(other: unknown): boolean {
    if (other instanceof PackageJSON) {
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

      return (
        this._name === other._name &&
        sameDependencies &&
        sameDevDependencies &&
        isEqual(this._additionalData, other._additionalData)
      );
    } else {
      return false;
    }
  }
}

function makeDependencyObject(
  dependencies: ReadonlyArray<Dependency>,
  namespace: string,
): Record<string, string> | undefined {
  if (dependencies.length === 0) {
    return undefined;
  }

  const result: Record<string, string> = {};

  dependencies
    .toSorted((a, b) => comparePackageNames(a.name, b.name, namespace))
    .forEach((d) => (result[d.name] = d.version));

  return result;
}

function comparePackageNames(a: string, b: string, namespace: string): number {
  if (a.startsWith(namespace) && b.startsWith(namespace)) {
    return a.localeCompare(b);
  } else if (a.startsWith(namespace)) {
    return -1;
  } else if (b.startsWith(namespace)) {
    return 1;
  } else {
    return a.localeCompare(b);
  }
}

function comparePackageJSONKeys(a: string, b: string): number {
  return getKeyIndex(a) - getKeyIndex(b);
}

function getKeyIndex(s: string): number {
  switch (s.toLowerCase()) {
    case 'name':
      return 0;
    case 'version':
      return 1;
    case 'private':
      return 2;
    case 'bin':
      return 3;
    case 'main':
      return 4;
    case 'module':
      return 5;
    case 'types':
      return 6;
    case 'exports':
      return 7;
    case 'scripts':
      return 8;
    case 'dependencies':
      return 9;
    case 'devDependencies':
      return 10;
    default:
      return Number.MAX_VALUE;
  }
}
