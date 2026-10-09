import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { makeLibraryPackageFileGenerators } from '../../packages/library-package/create-library-package';
import { PackageGenerator } from '../../utils/package-generator';
import {
  makeOxfmtConfigFileGenerators,
  makeOxlintConfigFileGenerators,
  makeRootPackageFileGenerators,
  makeTypescriptConfigFileGenerators,
} from '../../workspace';
import { applyMigration, planMigration } from '../migrate-workspace';

describe('planMigration', () => {
  let root: string;

  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'stack-migrate-'));
  });

  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true });
  });

  it('replaces a prettier config with an oxfmt config', async () => {
    await writeWorkspace(root, {
      'packages/my-lib/prettier.config.mjs':
        "import base from '@ws/prettier-config/base.mjs';\n\nexport default base;\n",
      'packages/my-lib/package.json': JSON.stringify({
        name: '@ws/my-lib',
        devDependencies: {
          '@ws/prettier-config': 'workspace:*',
          prettier: 'catalog:',
        },
        scripts: { format: 'prettier . --write' },
      }),
    });

    const changes = await planMigration(root);

    expect(describeAll(changes)).toContain(
      'delete packages/my-lib/prettier.config.mjs',
    );
    expect(describeAll(changes)).toContain(
      'write  packages/my-lib/oxfmt.config.mts',
    );
  });

  it('gives a react package the react oxfmt config', async () => {
    await writeWorkspace(root, {
      'packages/my-ui/prettier.config.mjs': 'export default {};\n',
      'packages/my-ui/package.json': JSON.stringify({
        name: '@ws/my-ui',
        dependencies: { react: 'catalog:' },
        devDependencies: { prettier: 'catalog:' },
      }),
    });

    const changes = await planMigration(root);

    const config = changes.find((c) => c.filepath.endsWith('oxfmt.config.mts'));

    if (config === undefined) {
      throw new Error('expected an oxfmt config change');
    }

    await applyMigration(root, [config]);

    const written = await fs.readFile(path.join(root, config.filepath), {
      encoding: 'utf-8',
    });

    expect(written).toContain("'@ws/oxfmt-config/react'");
  });

  it('replaces an eslint config with an oxlint config', async () => {
    await writeWorkspace(root, {
      'packages/my-lib/eslint.config.mjs':
        "import base from '@ws/eslint-config/base.mjs';\n\nexport default base;\n",
      'packages/my-lib/package.json': JSON.stringify({
        name: '@ws/my-lib',
        devDependencies: {
          '@ws/eslint-config': 'workspace:*',
          eslint: '^9.32.0',
          'typescript-eslint': '^8.0.0',
        },
        scripts: { lint: 'eslint .' },
      }),
    });

    const changes = await planMigration(root);

    expect(describeAll(changes)).toContain(
      'delete packages/my-lib/eslint.config.mjs',
    );
    expect(describeAll(changes)).toContain(
      'write  packages/my-lib/.oxlintrc.json',
    );

    await applyMigration(root, changes);

    const packageJson = JSON.parse(
      await fs.readFile(path.join(root, 'packages/my-lib/package.json'), {
        encoding: 'utf-8',
      }),
    );

    expect(packageJson.scripts.lint).toBe('oxlint');
    expect(Object.keys(packageJson.devDependencies)).toEqual(
      expect.arrayContaining(['@ws/oxlint-config', 'oxlint']),
    );
    expect(Object.keys(packageJson.devDependencies)).not.toEqual(
      expect.arrayContaining([
        'eslint',
        'typescript-eslint',
        '@ws/eslint-config',
      ]),
    );
  });

  it('replaces tsup with tsdown, picking the config for the package kind', async () => {
    await writeWorkspace(root, {
      'apps/my-cli/tsup.config.ts': 'export default {};\n',
      'apps/my-cli/package.json': JSON.stringify({
        name: '@ws/my-cli',
        bin: { 'my-cli': './dist/index.js' },
        devDependencies: { tsup: '^8.0.0' },
        scripts: { build: 'tsup' },
      }),
      'packages/my-lib/tsup.config.ts': 'export default {};\n',
      'packages/my-lib/package.json': JSON.stringify({
        name: '@ws/my-lib',
        devDependencies: { tsup: '^8.0.0' },
        scripts: { build: 'tsup' },
      }),
    });

    const changes = await planMigration(root);

    expect(describeAll(changes)).toContain('delete apps/my-cli/tsup.config.ts');
    expect(describeAll(changes)).toContain(
      'write  apps/my-cli/tsdown.config.ts',
    );

    await applyMigration(root, changes);

    const cliConfig = await read(root, 'apps/my-cli/tsdown.config.ts');
    const libConfig = await read(root, 'packages/my-lib/tsdown.config.ts');

    expect(cliConfig).toContain("platform: 'node'");
    expect(libConfig).not.toContain("platform: 'node'");

    const packageJson = JSON.parse(
      await read(root, 'apps/my-cli/package.json'),
    );

    expect(packageJson.scripts.build).toBe('tsdown');
    expect(packageJson.devDependencies.tsup).toBeUndefined();
  });

  it('moves every catalogable dependency onto the catalog', async () => {
    await writeWorkspace(root, {
      'apps/my-cli/package.json': JSON.stringify({
        name: '@ws/my-cli',
        dependencies: { commander: '14.0.2' },
        devDependencies: { vitest: '^3.2.4', tsx: '^4.21.0' },
        peerDependencies: { typescript: '^5.9.3', '@types/node': '^25.0.3' },
      }),
    });

    await applyMigration(root, await planMigration(root));

    const packageJson = JSON.parse(
      await read(root, 'apps/my-cli/package.json'),
    );

    expect(packageJson.dependencies.commander).toBe('catalog:');
    expect(packageJson.devDependencies.vitest).toBe('catalog:');
    expect(packageJson.devDependencies.tsx).toBe('catalog:');
    expect(packageJson.peerDependencies.typescript).toBe('catalog:');
    expect(packageJson.peerDependencies['@types/node']).toBe('catalog:');
  });

  it('leaves dependencies the catalog does not carry alone', async () => {
    await writeWorkspace(root, {
      'packages/my-lib/package.json': JSON.stringify({
        name: '@ws/my-lib',
        dependencies: { 'some-random-package': '^1.2.3' },
        devDependencies: { '@ws/typescript-config': 'workspace:*' },
      }),
    });

    await applyMigration(root, await planMigration(root));

    const packageJson = JSON.parse(
      await read(root, 'packages/my-lib/package.json'),
    );

    expect(packageJson.dependencies['some-random-package']).toBe('^1.2.3');
    expect(packageJson.devDependencies['@ws/typescript-config']).toBe(
      'workspace:*',
    );
  });

  it('replaces the legacy shared config packages', async () => {
    await writeWorkspace(root, {
      'configs/eslint-config/package.json': JSON.stringify({
        name: '@ws/eslint-config',
        devDependencies: { eslint: '^9.32.0' },
      }),
      'configs/eslint-config/base.mjs': 'export default [];\n',
      'configs/prettier-config/package.json': JSON.stringify({
        name: '@ws/prettier-config',
        devDependencies: { prettier: '^3.6.2' },
      }),
      'configs/prettier-config/base.mjs': 'export default {};\n',
    });

    await applyMigration(root, await planMigration(root));

    expect(await exists(root, 'configs/eslint-config')).toBe(false);
    expect(await exists(root, 'configs/prettier-config')).toBe(false);

    expect(
      await read(root, 'configs/oxlint-config/base.oxlintrc.json'),
    ).toContain('"correctness": "error"');
    expect(await read(root, 'configs/oxfmt-config/base.ts')).toContain(
      'defineConfig',
    );
    expect(await read(root, 'configs/oxfmt-config/package.json')).toContain(
      '"./base": "./base.ts"',
    );
  });

  it('refreshes the catalog', async () => {
    await writeWorkspace(root, {
      'packages/my-lib/package.json': JSON.stringify({
        name: '@ws/my-lib',
        devDependencies: { prettier: 'catalog:' },
      }),
    });

    await applyMigration(root, await planMigration(root));

    const workspaceYaml = await read(root, 'pnpm-workspace.yaml');

    expect(workspaceYaml).toContain('oxfmt:');
    expect(workspaceYaml).toContain('oxlint:');
    expect(workspaceYaml).not.toContain('prettier:');
  });

  it('adds the format tasks to turbo without discarding custom ones', async () => {
    await writeWorkspace(root, {
      'packages/my-lib/package.json': JSON.stringify({
        name: '@ws/my-lib',
        devDependencies: { prettier: 'catalog:' },
      }),
    });

    await write(
      root,
      'turbo.json',
      JSON.stringify({
        $schema: 'https://turbo.build/schema.json',
        tasks: {
          build: { dependsOn: ['^build'], outputs: ['dist/**'] },
          'check-types': { dependsOn: ['^check-types'] },
          deploy: { dependsOn: ['build'], cache: false },
        },
      }),
    );

    await applyMigration(root, await planMigration(root));

    const turbo = JSON.parse(await read(root, 'turbo.json'));

    expect(turbo.tasks['format:check']).toBeDefined();
    expect(turbo.tasks.format).toBeDefined();
    expect(turbo.tasks.deploy).toEqual({
      dependsOn: ['build'],
      cache: false,
    });
    expect(turbo.tasks['check-types']).toEqual({
      dependsOn: ['^check-types'],
    });
    expect(turbo.$schema).toBe('https://turbo.build/schema.json');
  });

  it('refuses a workspace it did not create', async () => {
    // A pnpm workspace with no namespaced config package is somebody else's
    // monorepo, and migrating it would rewrite every package.json in it.
    await write(root, 'package.json', JSON.stringify({ name: 'not-stack' }));
    await write(root, 'pnpm-workspace.yaml', 'packages:\n  - "packages/*"\n');
    await write(
      root,
      'packages/thing/package.json',
      JSON.stringify({
        name: '@not-stack/thing',
        devDependencies: { prettier: '^3.6.2' },
      }),
    );

    await expect(planMigration(root)).rejects.toThrow(/created by stack/i);
  });

  it('finds nothing to do in a freshly generated workspace', async () => {
    await generateCurrentWorkspace(root);

    expect(await planMigration(root)).toEqual([]);
  });
});

/**
 * Builds a workspace with the same generators `stack create` and `stack g` use,
 * so "already migrated" means "identical to what the current CLI produces".
 */
async function generateCurrentWorkspace(root: string): Promise<void> {
  const namespace = '@ws';

  await new PackageGenerator(
    root,
    makeRootPackageFileGenerators('ws'),
  ).generate();
  await new PackageGenerator(
    path.join(root, 'configs/oxlint-config'),
    makeOxlintConfigFileGenerators(namespace),
  ).generate();
  await new PackageGenerator(
    path.join(root, 'configs/oxfmt-config'),
    makeOxfmtConfigFileGenerators(namespace),
  ).generate();
  await new PackageGenerator(
    path.join(root, 'configs/typescript-config'),
    makeTypescriptConfigFileGenerators(namespace),
  ).generate();
  await new PackageGenerator(
    path.join(root, 'packages/my-lib'),
    makeLibraryPackageFileGenerators(`${namespace}/my-lib`, namespace),
  ).generate();
}

async function writeWorkspace(
  root: string,
  files: Record<string, string>,
): Promise<void> {
  await write(root, 'package.json', JSON.stringify({ name: 'ws' }));
  await write(
    root,
    'pnpm-workspace.yaml',
    'packages:\n  - "apps/*"\n  - "packages/*"\n  - "configs/*"\n',
  );

  // Every workspace stack creates has shared config packages, and migration
  // refuses to run without one. Already aligned, so it contributes no changes.
  await write(
    root,
    'configs/typescript-config/package.json',
    JSON.stringify({
      name: '@ws/typescript-config',
      devDependencies: { typescript: 'catalog:' },
    }),
  );

  for (const [filepath, contents] of Object.entries(files)) {
    await write(root, filepath, contents);
  }
}

async function write(
  root: string,
  filepath: string,
  contents: string,
): Promise<void> {
  const full = path.join(root, filepath);

  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, contents);
}

async function exists(root: string, filepath: string): Promise<boolean> {
  try {
    await fs.access(path.join(root, filepath));

    return true;
  } catch {
    return false;
  }
}

async function read(root: string, filepath: string): Promise<string> {
  return fs.readFile(path.join(root, filepath), { encoding: 'utf-8' });
}

function describeAll(changes: ReadonlyArray<{ describe(): string }>): string {
  return changes.map((c) => c.describe()).join('\n');
}
