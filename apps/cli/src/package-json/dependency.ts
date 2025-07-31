import { Equalable } from '@stack-dev/core';

export class Dependency implements Equalable {
  private readonly _name: string;

  private readonly _version: string;

  public constructor(name: string, version: string) {
    this._name = name;
    this._version = version;
  }

  public get name(): string {
    return this._name;
  }

  public get version(): string {
    return this._version;
  }

  public equals(other: unknown): boolean {
    if (other instanceof Dependency) {
      return this._name === other._name && this._version === other._version;
    } else {
      return false;
    }
  }
}
