import { Equalable, Snapshot, sortKeys } from '@stack-dev/core';

import { isEqual } from 'lodash';

export type ConstructorArgs = {
  paths?: Record<string, ReadonlyArray<string>>;
  additionalData?: Snapshot;
};

export class CompilerOptions implements Equalable {
  private readonly _additionalData: Snapshot;

  private readonly _paths: Record<string, ReadonlyArray<string>>;

  public constructor(args?: ConstructorArgs) {
    this._paths = args?.paths ?? {};
    this._additionalData = args?.additionalData ?? {};
  }

  public get paths(): Record<string, ReadonlyArray<string>> {
    return this._paths;
  }

  public get additionalData(): Snapshot {
    return this._additionalData;
  }

  public setPaths(
    paths: Record<string, ReadonlyArray<string>>,
  ): CompilerOptions {
    return new CompilerOptions({
      paths,
      additionalData: this._additionalData,
    });
  }

  public format(): string {
    const json = {
      paths: this._paths,
      ...this._additionalData,
    };

    const ordered = sortKeys(json, compareKeys);

    return JSON.stringify(ordered, null, 2);
  }

  public equals(other: unknown): boolean {
    // TODO: Get rid of lodash.

    if (other instanceof CompilerOptions) {
      return (
        isEqual(this._paths, other._paths) &&
        isEqual(this._additionalData, other._additionalData)
      );
    } else {
      return false;
    }
  }
}

function compareKeys(a: string, b: string): number {
  return getKeyIndex(a) - getKeyIndex(b);
}

function getKeyIndex(s: string): number {
  const order = [
    'target',
    'module',
    'moduleResolution',
    'esModuleInterop',
    'lib',
    'types',
    'strict',
    'allowJs',
  ];

  if (order.every((key) => key !== s)) {
    return Number.MAX_VALUE;
  } else {
    return order.indexOf(s);
  }
}
