export function sortKeys<T extends Record<string, unknown>>(
  obj: T,
  comparer: (a: string, b: string) => number,
): Record<string, unknown> {
  const sortedEntries = Object.entries(obj).sort(([a], [b]) => comparer(a, b));
  return Object.fromEntries(sortedEntries);
}
