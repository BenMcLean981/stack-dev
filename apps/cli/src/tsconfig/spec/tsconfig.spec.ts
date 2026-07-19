import { describe, expect, it } from 'vitest';

import { CompilerOptions } from '../compiler-options';
import { Reference } from '../reference';
import { TSConfig } from '../tsconfig';

describe('TSConfig', () => {
  describe('parse', () => {
    it('lifts paths out of compilerOptions', () => {
      const tsconfig = TSConfig.parse(
        JSON.stringify({
          compilerOptions: {
            strict: true,
            paths: { '@ns/core': ['../core/src/index.ts'] },
          },
        }),
      );

      expect(tsconfig.compilerOptions.paths).toEqual({
        '@ns/core': ['../core/src/index.ts'],
      });
      expect(tsconfig.compilerOptions.additionalData).toEqual({ strict: true });
    });

    it('defaults paths to empty when compilerOptions is absent', () => {
      const tsconfig = TSConfig.parse('{ "extends": "./base.json" }');

      expect(tsconfig.compilerOptions.paths).toEqual({});
    });

    it('accepts comments and trailing commas', () => {
      const tsconfig = TSConfig.parse(`{
        // the shared base
        "extends": "./base.json",
        "include": ["src"],
      }`);

      expect(JSON.parse(tsconfig.format()).extends).toBe('./base.json');
    });

    it('round trips through format', () => {
      const original = new TSConfig({
        compilerOptions: new CompilerOptions({
          paths: { '@ns/core': ['../core/src/index.ts'] },
          additionalData: { strict: true },
        }),
        references: [new Reference('../core')],
        additionalData: { extends: './base.json', include: ['src'] },
      });

      const reparsed = TSConfig.parse(original.format());

      expect(reparsed.equals(original)).toBe(true);
    });
  });

  describe('addReference', () => {
    it('appends without mutating the original', () => {
      const original = new TSConfig({
        references: [new Reference('../core')],
      });

      const updated = original.addReference(new Reference('../ui'));

      expect(JSON.parse(original.format()).references).toEqual([
        { path: '../core' },
      ]);
      expect(JSON.parse(updated.format()).references).toEqual([
        { path: '../core' },
        { path: '../ui' },
      ]);
    });
  });

  describe('setCompilerOptions', () => {
    it('preserves references and additional data', () => {
      const original = new TSConfig({
        references: [new Reference('../core')],
        additionalData: { extends: './base.json' },
      });

      const updated = original.setCompilerOptions(
        new CompilerOptions({ paths: { '@ns/ui': ['../ui/src/index.ts'] } }),
      );

      const formatted = JSON.parse(updated.format());

      expect(formatted.extends).toBe('./base.json');
      expect(formatted.references).toEqual([{ path: '../core' }]);
      expect(formatted.compilerOptions.paths).toEqual({
        '@ns/ui': ['../ui/src/index.ts'],
      });
    });
  });

  describe('format', () => {
    it('orders well known keys ahead of unrecognized ones', () => {
      const tsconfig = new TSConfig({
        additionalData: {
          exclude: ['dist'],
          extends: './base.json',
          include: ['src'],
          someUnknownKey: true,
        },
      });

      expect(Object.keys(JSON.parse(tsconfig.format()))).toEqual([
        'extends',
        'compilerOptions',
        'include',
        'exclude',
        'references',
        'someUnknownKey',
      ]);
    });
  });

  describe('equals', () => {
    it('ignores reference ordering', () => {
      const a = new TSConfig({
        references: [new Reference('../core'), new Reference('../ui')],
      });
      const b = new TSConfig({
        references: [new Reference('../ui'), new Reference('../core')],
      });

      expect(a.equals(b)).toBe(true);
    });

    it('distinguishes differing compiler options', () => {
      const a = new TSConfig({
        compilerOptions: new CompilerOptions({
          additionalData: { strict: true },
        }),
      });
      const b = new TSConfig({
        compilerOptions: new CompilerOptions({
          additionalData: { strict: false },
        }),
      });

      expect(a.equals(b)).toBe(false);
    });

    it('is false for non TSConfig values', () => {
      expect(new TSConfig().equals({ references: [] })).toBe(false);
    });
  });
});
