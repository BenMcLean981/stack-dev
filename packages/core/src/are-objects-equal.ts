import { EqualityChecker, defaultEqualityChecker } from './have-same-items';

export function areObjectsEqual<T>(
  a: Record<string, T>,
  b: Record<string, T>,
  areEqual: EqualityChecker<T> = defaultEqualityChecker,
): boolean {
  return (
    areObjectsEqualInOneDirection(a, b, areEqual) ||
    areObjectsEqualInOneDirection(b, a, areEqual)
  );
}

function areObjectsEqualInOneDirection<T>(
  a: Record<string, T>,
  b: Record<string, T>,
  areEqual: EqualityChecker<T>,
): boolean {
  for (const key of Object.keys(a)) {
    if (!(key in b) || !areEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
}
