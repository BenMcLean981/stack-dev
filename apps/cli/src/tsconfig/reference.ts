import { Equalable } from '@stack-dev/core';

export class Reference implements Equalable {
  private readonly _path: string;

  public constructor(path: string) {
    this._path = path;
  }

  public get path(): string {
    return this._path;
  }

  equals(other: unknown): boolean {
    if (other instanceof Reference) {
      return this._path === other._path;
    } else {
      return false;
    }
  }
}
