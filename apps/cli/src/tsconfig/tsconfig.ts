import * as JSON5 from 'json5';

import { Equalable, haveSameItems } from '@stack-dev/core';

import { Snapshot } from '@stack-dev/core';
import { isEqual } from 'lodash';
import { CompilerOptions } from './compiler-options';
import { Reference } from './reference';

type ConstructorArgs = {
  compilerOptions?: CompilerOptions;
  references?: ReadonlyArray<Reference>;
  additionalData?: Snapshot;
};

export class TSConfig implements Equalable {
  private readonly _compilerOptions: CompilerOptions;

  private readonly _references: ReadonlyArray<Reference>;

  private readonly _additionalData: Snapshot;

  public constructor(args?: ConstructorArgs) {
    this._compilerOptions = args?.compilerOptions ?? new CompilerOptions();
    this._references = args?.references ?? [];
    this._additionalData = args?.additionalData ?? {};
  }

  public get compilerOptions(): CompilerOptions {
    return this._compilerOptions;
  }

  public addReference(reference: Reference): TSConfig {
    return new TSConfig({
      compilerOptions: this._compilerOptions,
      references: [...this._references, reference],
      additionalData: this._additionalData,
    });
  }

  public setCompilerOptions(compilerOptions: CompilerOptions): TSConfig {
    return new TSConfig({
      compilerOptions,
      references: this._references,
      additionalData: this._additionalData,
    });
  }

  public static parse(s: string): TSConfig {
    const json = JSON5.parse(s);

    const references = json.references.map(
      (r: Record<string, string>) => new Reference(r.path),
    );

    const compilerOptions = new CompilerOptions({
      paths: json.compilerOptions?.paths,
      ...json.compilerOptions,
    });

    const additionalData = { ...json };
    delete additionalData['compilerOptions'];
    delete additionalData['references'];

    return new TSConfig({
      compilerOptions,
      references,
      additionalData,
    });
  }

  public format(): string {
    const json = {
      compilerOptions: this._compilerOptions.format(),
      references: this._references.map((r) => ({ path: r.path })),
      ...this._additionalData,
    };

    return JSON5.stringify(json);
  }

  public equals(other: unknown): boolean {
    if (other instanceof TSConfig) {
      const sameReferences = haveSameItems(
        this._references,
        other._references,
        (r1, r2) => r1.equals(r2),
      );

      return (
        sameReferences && isEqual(this._additionalData, other._additionalData)
      );
    } else {
      return false;
    }
  }
}
