import { describe, expect, it } from 'vitest';

import { Dependency } from '../dependency';
import { PackageJSON } from '../package-json';

describe('PackageJSON', () => {
  describe('format', () => {
    it('orders dependencies, devDependencies, then peerDependencies', () => {
      const packageJson = new PackageJSON({
        name: '@ns/thing',
        dependencies: [new Dependency('commander', '^11.1.0')],
        devDependencies: [new Dependency('vitest', '^3.2.4')],
        peerDependencies: [new Dependency('react', '^19.0.0')],
      });

      const keys = Object.keys(JSON.parse(packageJson.format('@ns')));

      expect(keys).toEqual([
        'name',
        'dependencies',
        'devDependencies',
        'peerDependencies',
      ]);
    });

    it('orders well known keys ahead of unrecognized ones', () => {
      const packageJson = new PackageJSON({
        name: '@ns/thing',
        dependencies: [new Dependency('commander', '^11.1.0')],
        additionalData: {
          sideEffects: false,
          version: '0.1.0',
          scripts: { build: 'tsdown' },
          private: true,
        },
      });

      const keys = Object.keys(JSON.parse(packageJson.format('@ns')));

      expect(keys).toEqual([
        'name',
        'version',
        'private',
        'scripts',
        'dependencies',
        'sideEffects',
      ]);
    });

    it('sorts namespaced dependencies ahead of external ones', () => {
      const packageJson = new PackageJSON({
        name: '@ns/thing',
        dependencies: [
          new Dependency('commander', '^11.1.0'),
          new Dependency('@ns/core', 'workspace:*'),
          new Dependency('yaml', '^2.8.0'),
          new Dependency('@ns/anvil', 'workspace:*'),
        ],
      });

      const { dependencies } = JSON.parse(packageJson.format('@ns'));

      expect(Object.keys(dependencies)).toEqual([
        '@ns/anvil',
        '@ns/core',
        'commander',
        'yaml',
      ]);
    });

    it('omits empty dependency groups', () => {
      const packageJson = new PackageJSON({ name: '@ns/thing' });

      expect(JSON.parse(packageJson.format('@ns'))).toEqual({
        name: '@ns/thing',
      });
    });
  });

  describe('parse', () => {
    it('splits dependency groups out of the remaining data', () => {
      const packageJson = PackageJSON.parse(
        JSON.stringify({
          name: '@ns/thing',
          version: '0.1.0',
          dependencies: { commander: '^11.1.0' },
          devDependencies: { vitest: '^3.2.4' },
          peerDependencies: { react: '^19.0.0' },
        }),
      );

      expect(packageJson.name).toBe('@ns/thing');
      expect(packageJson.dependencies).toEqual([
        new Dependency('commander', '^11.1.0'),
      ]);
      expect(packageJson.devDependencies).toEqual([
        new Dependency('vitest', '^3.2.4'),
      ]);
      expect(packageJson.peerDependencies).toEqual([
        new Dependency('react', '^19.0.0'),
      ]);
    });

    it('defaults missing dependency groups to empty', () => {
      const packageJson = PackageJSON.parse('{ "name": "@ns/thing" }');

      expect(packageJson.dependencies).toEqual([]);
      expect(packageJson.devDependencies).toEqual([]);
      expect(packageJson.peerDependencies).toEqual([]);
    });

    it('round trips through format', () => {
      const original = new PackageJSON({
        name: '@ns/thing',
        dependencies: [new Dependency('commander', '^11.1.0')],
        devDependencies: [new Dependency('vitest', '^3.2.4')],
        peerDependencies: [new Dependency('react', '^19.0.0')],
        additionalData: { version: '0.1.0', sideEffects: false },
      });

      const reparsed = PackageJSON.parse(original.format('@ns'));

      expect(reparsed.equals(original)).toBe(true);
    });
  });

  describe('equals', () => {
    it('ignores dependency ordering', () => {
      const a = new PackageJSON({
        name: '@ns/thing',
        dependencies: [
          new Dependency('commander', '^11.1.0'),
          new Dependency('yaml', '^2.8.0'),
        ],
      });
      const b = new PackageJSON({
        name: '@ns/thing',
        dependencies: [
          new Dependency('yaml', '^2.8.0'),
          new Dependency('commander', '^11.1.0'),
        ],
      });

      expect(a.equals(b)).toBe(true);
    });

    it('distinguishes differing dependency versions', () => {
      const a = new PackageJSON({
        name: '@ns/thing',
        dependencies: [new Dependency('commander', '^11.1.0')],
      });
      const b = new PackageJSON({
        name: '@ns/thing',
        dependencies: [new Dependency('commander', '^12.0.0')],
      });

      expect(a.equals(b)).toBe(false);
    });

    it('distinguishes a dependency from a devDependency', () => {
      const dependency = new Dependency('commander', '^11.1.0');

      const a = new PackageJSON({
        name: '@ns/thing',
        dependencies: [dependency],
      });
      const b = new PackageJSON({
        name: '@ns/thing',
        devDependencies: [dependency],
      });

      expect(a.equals(b)).toBe(false);
    });

    it('is false for non PackageJSON values', () => {
      const packageJson = new PackageJSON({ name: '@ns/thing' });

      expect(packageJson.equals({ name: '@ns/thing' })).toBe(false);
      expect(packageJson.equals(undefined)).toBe(false);
    });
  });

  describe('addDependency', () => {
    it('preserves peerDependencies', () => {
      const peer = new Dependency('react', '^19.0.0');

      const packageJson = new PackageJSON({
        name: '@ns/thing',
        peerDependencies: [peer],
      });

      const updated = packageJson.addDependency(
        new Dependency('commander', '^11.1.0'),
      );

      expect(updated.peerDependencies).toEqual([peer]);
    });
  });

  describe('addDevDependency', () => {
    it('preserves peerDependencies', () => {
      const peer = new Dependency('react', '^19.0.0');

      const packageJson = new PackageJSON({
        name: '@ns/thing',
        peerDependencies: [peer],
      });

      const updated = packageJson.addDevDependency(
        new Dependency('vitest', '^3.2.4'),
      );

      expect(updated.peerDependencies).toEqual([peer]);
    });
  });

  describe('removeDependency', () => {
    it('removes only the named dependency', () => {
      const kept = new Dependency('commander', '^11.1.0');

      const packageJson = new PackageJSON({
        name: '@ns/thing',
        dependencies: [kept, new Dependency('lodash', '^4.17.21')],
      });

      const updated = packageJson.removeDependency('lodash');

      expect(updated.dependencies).toEqual([kept]);
    });

    it('preserves peerDependencies', () => {
      const peer = new Dependency('react', '^19.0.0');

      const packageJson = new PackageJSON({
        name: '@ns/thing',
        dependencies: [new Dependency('lodash', '^4.17.21')],
        peerDependencies: [peer],
      });

      const updated = packageJson.removeDependency('lodash');

      expect(updated.peerDependencies).toEqual([peer]);
    });
  });

  describe('removeDevDependency', () => {
    it('removes only the named devDependency', () => {
      const kept = new Dependency('vitest', '^3.2.4');

      const packageJson = new PackageJSON({
        name: '@ns/thing',
        devDependencies: [kept, new Dependency('eslint', '^9.32.0')],
      });

      const updated = packageJson.removeDevDependency('eslint');

      expect(updated.devDependencies).toEqual([kept]);
    });

    it('preserves peerDependencies', () => {
      const peer = new Dependency('react', '^19.0.0');

      const packageJson = new PackageJSON({
        name: '@ns/thing',
        devDependencies: [new Dependency('eslint', '^9.32.0')],
        peerDependencies: [peer],
      });

      const updated = packageJson.removeDevDependency('eslint');

      expect(updated.peerDependencies).toEqual([peer]);
    });
  });
});
