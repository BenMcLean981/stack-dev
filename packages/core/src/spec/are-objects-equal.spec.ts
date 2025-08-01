import { describe, expect, it } from 'vitest';

import { areObjectsEqual } from '../are-objects-equal';

describe('areObjectsEqual', () => {
  it('Returns true for both empty.', () => {
    expect(areObjectsEqual({}, {})).toBe(true);
  });

  it('Returns false with different keys.', () => {
    const a = { a: 1, b: 2 };
    const b = { a: 1, c: 3 };

    expect(areObjectsEqual(a, b)).toBe(false);
  });

  it('Returns false with different values.', () => {
    const a = { a: 1, b: 2 };
    const b = { b: 3, a: 1 };

    expect(areObjectsEqual(a, b)).toBe(false);
  });

  it('Returns true with same values.', () => {
    const a = { a: 1, b: 2 };
    const b = { b: 2, a: 1 };

    expect(areObjectsEqual(a, b)).toBe(true);
  });
});
