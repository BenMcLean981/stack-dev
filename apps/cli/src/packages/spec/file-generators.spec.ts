import { describe, expect, it } from 'vitest';

import { FileGenerator } from '../../file-generator';
import { CATALOG } from '../../package-json';
import {
  makeOxlintConfigFileGenerators,
  makePrettierConfigFileGenerators,
  makeRootPackageFileGenerators,
  makeTypescriptConfigFileGenerators,
} from '../../workspace';
import { makeCliAppFileGenerators } from '../cli-app/create-cli-app';
import { makeConfigPackageFileGenerators } from '../create-config-package';
import { makeFastifyAppFileGenerators } from '../fastify-app/create-fastify-app';
import { makeLibraryPackageFileGenerators } from '../library-package/create-library-package';
import { makeStyledComponentsReactPackageFileGenerators } from '../react-package/styled-components-react-package/create-styled-components-react-package';
import { makeUnstyledReactPackageFileGenerators } from '../react-package/unstyled-react-package/create-unstyled-react-package';
import { makeViteReactAppFileGenerators } from '../vite-react-app/create-vite-react-app';

const NAMESPACE = '@acme';
const PACKAGE_NAME = `${NAMESPACE}/widget`;

const PACKAGE_TYPES = [
  ['config', makeConfigPackageFileGenerators(PACKAGE_NAME, NAMESPACE)],
  ['library', makeLibraryPackageFileGenerators(PACKAGE_NAME, NAMESPACE)],
  ['cli-app', makeCliAppFileGenerators(PACKAGE_NAME, NAMESPACE)],
  ['fastify-app', makeFastifyAppFileGenerators(PACKAGE_NAME, NAMESPACE)],
  ['vite-react-app', makeViteReactAppFileGenerators(PACKAGE_NAME, NAMESPACE)],
  [
    'react-unstyled',
    makeUnstyledReactPackageFileGenerators(PACKAGE_NAME, NAMESPACE),
  ],
  [
    'react-styled-components',
    makeStyledComponentsReactPackageFileGenerators(PACKAGE_NAME, NAMESPACE),
  ],
] as const satisfies ReadonlyArray<
  readonly [string, ReadonlyArray<FileGenerator>]
>;

const WORKSPACE_PACKAGES = [
  ['workspace-root', makeRootPackageFileGenerators('acme')],
  ['workspace-oxlint-config', makeOxlintConfigFileGenerators(NAMESPACE)],
  ['workspace-prettier-config', makePrettierConfigFileGenerators(NAMESPACE)],
  [
    'workspace-typescript-config',
    makeTypescriptConfigFileGenerators(NAMESPACE),
  ],
] as const satisfies ReadonlyArray<
  readonly [string, ReadonlyArray<FileGenerator>]
>;

const ALL = [...PACKAGE_TYPES, ...WORKSPACE_PACKAGES];

describe('file generators', () => {
  describe.each(ALL)('%s', (name, generators) => {
    it('generates the expected files', async () => {
      await expect(await renderGenerators(generators)).toMatchFileSnapshot(
        `./__snapshots__/${name}.md`,
      );
    });

    it('writes each file exactly once', () => {
      const filepaths = generators.map((g) => g.filepath);

      expect(filepaths).toEqual([...new Set(filepaths)]);
    });

    it('generates a package.json', () => {
      expect(generators.map((g) => g.filepath)).toContain('package.json');
    });

    it('only references catalog entries that exist', async () => {
      const packageJson = generators.find(
        (g) => g.filepath === 'package.json',
      );

      if (packageJson === undefined) {
        throw new Error('expected a package.json generator');
      }

      const parsed = JSON.parse(await packageJson.generate());

      const versions = ['dependencies', 'devDependencies', 'peerDependencies']
        .flatMap((section) => Object.entries(parsed[section] ?? {}))
        .filter(([, version]) => version === 'catalog:')
        .map(([name]) => name);

      versions.forEach((name) => {
        expect(name in CATALOG, `"${name}" is missing from the catalog`).toBe(
          true,
        );
      });
    });
  });
});

async function renderGenerators(
  generators: ReadonlyArray<FileGenerator>,
): Promise<string> {
  const sections = await Promise.all(
    [...generators]
      .toSorted((a, b) => a.filepath.localeCompare(b.filepath))
      .map(async (generator) => {
        const contents = await generator.generate();

        return `## ${generator.filepath}\n\n\`\`\`\n${contents.trimEnd()}\n\`\`\`\n`;
      }),
  );

  return sections.join('\n');
}
