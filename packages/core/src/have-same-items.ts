// TODO: Break this up
export const TOL = 1e-8;

export type EqualityChecker<T> = (t1: T, t2: T, tol?: number) => boolean;

export interface Equalable {
  equals(other: unknown, tol?: number): boolean;
}

export function isEqualable(t: unknown): t is Equalable {
  return (
    typeof t === 'object' &&
    t !== null &&
    'equals' in t &&
    typeof t.equals === 'function'
  );
}

export const defaultEqualityChecker: EqualityChecker<unknown> = (
  t1,
  t2,
  tol = TOL,
) => {
  if (isEqualable(t1)) {
    return t1.equals(t2, tol);
  } else {
    return t1 === t2;
  }
};

export function haveSameItems<T>(
  it1: Iterable<T>,
  it2: Iterable<T>,
  check: EqualityChecker<T> = defaultEqualityChecker,
): boolean {
  if (bothZeroLength<T>(it1, it2)) {
    return true;
  }

  if (diffLength<T>(it1, it2)) {
    return false;
  }

  return haveSameItems_sameLength(it1, it2, check);
}

function haveSameItems_sameLength<T>(
  it1: Iterable<T>,
  it2: Iterable<T>,
  check: EqualityChecker<T>,
) {
  const arr1 = [...it1];
  let arr2 = [...it2];

  for (const item1 of arr1) {
    const i2 = arr2.findIndex((item2) => check(item1, item2));
    if (i2 === -1) {
      return false;
    } else {
      arr2 = remoteAtIndex(arr2, i2);
    }
  }

  return true;
}

function remoteAtIndex<T>(arr: Array<T>, i2: number): Array<T> {
  const before = arr.slice(0, i2);
  const after = arr.slice(i2 + 1);

  return [...before, ...after];
}

function diffLength<T>(it1: Iterable<T>, it2: Iterable<T>) {
  return getSize(it1) !== getSize(it2);
}

function bothZeroLength<T>(it1: Iterable<T>, it2: Iterable<T>) {
  return getSize(it1) === 0 && getSize(it2) === 0;
}

function getSize(it: Iterable<unknown>): number {
  return [...it].length;
}
