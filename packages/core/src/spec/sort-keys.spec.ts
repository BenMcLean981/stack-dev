import { describe, expect, it } from 'vitest';

import { areObjectsEqual } from '../are-objects-equal';
import { sortKeys } from '../sort-keys';

describe('sortKeys', () => {
  it('sorts keys alphabetically', () => {
    const input = {
      z: 1,
      a: 2,
      m: 3,
    };

    const result = sortKeys(input, (a, b) => a.localeCompare(b));

    expect(Object.keys(result)).toEqual(['a', 'm', 'z']);
  });

  it('prioritizes certain keys using a custom comparer', () => {
    const input = {
      scripts: {},
      version: '1.0.0',
      name: 'my-package',
      dependencies: {},
    };

    function comparer(a: string, b: string) {
      return getIndex(a) - getIndex(b);
    }

    function getIndex(s: string): number {
      switch (s.toLowerCase()) {
        case 'name':
          return 1;
        case 'version':
          return 2;
        case 'scripts':
          return 3;
        case 'dependencies':
          return 4;
        default:
          return 0;
      }
    }

    const result = sortKeys(input, comparer);

    expect(Object.keys(result)).toEqual([
      'name',
      'version',
      'scripts',
      'dependencies',
    ]);

    expect(areObjectsEqual(input, result)).toBe(true);
  });
});
