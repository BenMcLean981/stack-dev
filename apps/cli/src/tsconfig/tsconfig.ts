import { Equalable, haveSameItems, sortKeys } from '@stack-dev/core';
import { Snapshot } from '@stack-dev/core';
import * as JSON5 from 'json5';
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
    const references = TSConfig.parseReferences(json);

    const { paths, ...otherCompilerOptions } = json.compilerOptions || {};

    const compilerOptions = new CompilerOptions({
      paths: paths ?? {},
      additionalData: otherCompilerOptions,
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

  private static parseReferences(json: unknown): ReadonlyArray<Reference> {
    if (
      typeof json === 'object' &&
      json !== null &&
      'references' in json &&
      json.references instanceof Array
    ) {
      return json.references.map(
        (r: Record<string, string>) => new Reference(r.path),
      );
    } else {
      return [];
    }
  }

  public format(): string {
    const compilerOptions = JSON5.parse(this.compilerOptions.format());

    const json = {
      compilerOptions,
      references: this._references.map((r) => ({ path: r.path })),
      ...this._additionalData,
    };

    const ordered = sortKeys(json, compareKeys);

    return `${stringifyWithInlineArrays(ordered)}\n`;
  }

  public equals(other: unknown): boolean {
    if (other instanceof TSConfig) {
      const sameReferences = haveSameItems(
        this._references,
        other._references,
        (r1, r2) => r1.equals(r2),
      );

      return (
        this._compilerOptions.equals(other._compilerOptions) &&
        sameReferences &&
        isEqual(this._additionalData, other._additionalData)
      );
    } else {
      return false;
    }
  }
}

// TODO: orderKeys (by array);
function compareKeys(a: string, b: string): number {
  return getKeyIndex(a) - getKeyIndex(b);
}

function getKeyIndex(s: string): number {
  const order = [
    'extends',
    'compilerOptions',
    'include',
    'exclude',
    'references',
  ];

  if (order.every((key) => key !== s)) {
    return Number.MAX_VALUE;
  } else {
    return order.indexOf(s);
  }
}

const PRINT_WIDTH = 80;

const INDENT = '  ';

/**
 * Serializes `value` like `JSON.stringify(value, null, 2)`, except that an
 * array of primitives is kept on one line when it fits within the print width.
 *
 * `JSON.stringify` always expands arrays, which the workspace formatter would
 * then collapse again — leaving a file this CLI just wrote failing its own
 * `format:check`. Matching the formatter here keeps a single source of truth.
 */
function stringifyWithInlineArrays(value: unknown, depth = 0): string {
  if (Array.isArray(value)) {
    return stringifyArray(value, depth);
  }

  if (isRecord(value)) {
    return stringifyRecord(value, depth);
  }

  return JSON.stringify(value) ?? 'null';
}

function stringifyArray(value: ReadonlyArray<unknown>, depth: number): string {
  if (value.length === 0) {
    return '[]';
  }

  const items = value.map((item) => stringifyWithInlineArrays(item, depth + 1));

  if (value.every(isPrimitive)) {
    const inline = `[${items.join(', ')}]`;

    if (indentOf(depth).length + inline.length <= PRINT_WIDTH) {
      return inline;
    }
  }

  return wrap('[', items, ']', depth);
}

function stringifyRecord(
  value: Record<string, unknown>,
  depth: number,
): string {
  const entries = Object.entries(value).filter(
    ([, item]) => item !== undefined,
  );

  if (entries.length === 0) {
    return '{}';
  }

  const items = entries.map(
    ([key, item]) =>
      `${JSON.stringify(key)}: ${stringifyWithInlineArrays(item, depth + 1)}`,
  );

  return wrap('{', items, '}', depth);
}

function wrap(
  open: string,
  items: ReadonlyArray<string>,
  close: string,
  depth: number,
): string {
  const inner = indentOf(depth + 1);

  return [
    open,
    items.map((item) => `${inner}${item}`).join(',\n'),
    `${indentOf(depth)}${close}`,
  ].join('\n');
}

function indentOf(depth: number): string {
  return INDENT.repeat(depth);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPrimitive(value: unknown): boolean {
  return value === null || typeof value !== 'object';
}
