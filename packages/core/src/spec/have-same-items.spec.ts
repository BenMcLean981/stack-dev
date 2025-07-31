import { describe, expect, it } from 'vitest';

import { haveSameItems } from '../have-same-items';

const numsEqual = (n1: number, n2: number) => n1 === n2;

describe('haveSameItems', () => {
  it('Returns true for empty.', () => {
    expect(haveSameItems([], [], () => false)).toBe(true);
  });

  it('Returns false for different sizes', () => {
    expect(haveSameItems([], [1], () => true)).toBe(false);
    expect(haveSameItems([1], [], () => true)).toBe(false);
  });

  it('Returns true for equal in order.', () => {
    expect(haveSameItems([1, 2, 3], [1, 2, 3], numsEqual)).toBe(true);
  });

  it('Returns true for same items.', () => {
    expect(haveSameItems([1, 2, 3], [2, 1, 3], numsEqual)).toBe(true);
  });

  it('Returns false for different items.', () => {
    expect(haveSameItems([1, 2, 0], [2, 1, 3], numsEqual)).toBe(false);
    expect(haveSameItems([1, 1, 1], [2, 1, 1], numsEqual)).toBe(false);
  });
});
