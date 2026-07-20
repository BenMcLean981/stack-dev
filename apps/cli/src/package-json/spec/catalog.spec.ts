import { describe, expect, it } from 'vitest';

import { CATALOG, catalogDependency, makeCatalogYaml } from '../catalog';
import { Dependency } from '../dependency';

describe('catalogDependency', () => {
  it('creates a dependency that references the catalog', () => {
    const dependency = catalogDependency('oxlint');

    expect(dependency.equals(new Dependency('oxlint', 'catalog:'))).toBe(true);
  });

  it('throws when the dependency is not in the catalog', () => {
    expect(() => catalogDependency('not-a-real-package')).toThrow();
  });
});

describe('makeCatalogYaml', () => {
  it('renders every catalog entry sorted by name', () => {
    const names = Object.keys(CATALOG).toSorted((a, b) => a.localeCompare(b));

    const yaml = makeCatalogYaml();

    const rendered = yaml
      .split('\n')
      .slice(1) // drop the "catalog:" header
      .filter((line) => line.trim().length > 0)
      .map((line) => line.trim().split(':')[0].replace(/'/g, ''));

    expect(rendered).toEqual(names);
  });
});
