import { describe, expect, it } from 'vitest';

import { Dependency } from '../dependency';

describe('Dependency', () => {
  describe('equals', () => {
    it('is true for the same name and version', () => {
      const a = new Dependency('commander', '^11.1.0');
      const b = new Dependency('commander', '^11.1.0');

      expect(a.equals(b)).toBe(true);
    });

    it('is false for a differing version', () => {
      const a = new Dependency('commander', '^11.1.0');
      const b = new Dependency('commander', '^12.0.0');

      expect(a.equals(b)).toBe(false);
    });

    it('is false for a differing name', () => {
      const a = new Dependency('commander', '^11.1.0');
      const b = new Dependency('yaml', '^11.1.0');

      expect(a.equals(b)).toBe(false);
    });

    it('is false for non Dependency values', () => {
      const dependency = new Dependency('commander', '^11.1.0');

      expect(dependency.equals({ name: 'commander', version: '^11.1.0' })).toBe(
        false,
      );
      expect(dependency.equals(undefined)).toBe(false);
    });
  });
});
