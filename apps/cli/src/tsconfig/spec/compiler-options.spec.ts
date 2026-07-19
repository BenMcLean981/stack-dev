import { describe, expect, it } from 'vitest';

import { CompilerOptions } from '../compiler-options';

describe('CompilerOptions', () => {
  describe('setPaths', () => {
    it('replaces paths without mutating the original', () => {
      const original = new CompilerOptions({
        paths: { '@ns/core': ['../core/src/index.ts'] },
      });

      const updated = original.setPaths({ '@ns/ui': ['../ui/src/index.ts'] });

      expect(original.paths).toEqual({ '@ns/core': ['../core/src/index.ts'] });
      expect(updated.paths).toEqual({ '@ns/ui': ['../ui/src/index.ts'] });
    });

    it('preserves additional data', () => {
      const original = new CompilerOptions({
        additionalData: { strict: true },
      });

      const updated = original.setPaths({ '@ns/ui': ['../ui/src/index.ts'] });

      expect(updated.additionalData).toEqual({ strict: true });
    });
  });

  describe('format', () => {
    it('orders well known keys ahead of unrecognized ones', () => {
      const compilerOptions = new CompilerOptions({
        paths: {},
        additionalData: {
          strict: true,
          target: 'ESNext',
          module: 'ESNext',
        },
      });

      const keys = Object.keys(JSON.parse(compilerOptions.format()));

      expect(keys).toEqual(['target', 'module', 'strict', 'paths']);
    });
  });

  describe('equals', () => {
    it('is true for matching paths and additional data', () => {
      const a = new CompilerOptions({
        paths: { '@ns/core': ['../core/src/index.ts'] },
        additionalData: { strict: true },
      });
      const b = new CompilerOptions({
        paths: { '@ns/core': ['../core/src/index.ts'] },
        additionalData: { strict: true },
      });

      expect(a.equals(b)).toBe(true);
    });

    it('is false for differing paths', () => {
      const a = new CompilerOptions({
        paths: { '@ns/core': ['../core/src/index.ts'] },
      });
      const b = new CompilerOptions({
        paths: { '@ns/core': ['../other/src/index.ts'] },
      });

      expect(a.equals(b)).toBe(false);
    });

    it('is false for non CompilerOptions values', () => {
      expect(new CompilerOptions().equals({ paths: {} })).toBe(false);
    });
  });
});
