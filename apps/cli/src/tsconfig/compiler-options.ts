import { Equalable, Snapshot } from '@stack-dev/core';

import JSON5 from 'json5';

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
      compilerOptions: this._paths,
      ...this._additionalData,
    };

    return JSON5.stringify(json);
  }

  public equals(other: unknown, tol?: number): boolean {
    throw new Error('Method not implemented.');
  }
}
