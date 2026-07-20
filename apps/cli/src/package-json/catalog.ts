import { Dependency } from './dependency';

/**
 * The default pnpm catalog for generated workspaces.
 *
 * Every external dependency any generator emits as `catalog:` must have an
 * entry here, otherwise the generated workspace will not install. When two
 * generators disagree on a version range, the highest range wins so the whole
 * workspace shares a single version.
 *
 * Use {@link catalogDependency} to reference an entry; it fails loudly if the
 * name is missing from the catalog.
 */
export const CATALOG: Record<string, string> = {
  '@fastify/swagger': '^9.6.1',
  '@fastify/swagger-ui': '^5.2.3',
  '@testing-library/jest-dom': '^6.0.0',
  '@testing-library/react': '^16.0.0',
  '@types/node': '^25.0.3',
  '@types/react': '^18.3.1',
  '@types/react-dom': '^18.3.1',
  '@types/styled-components': '^5.1.34',
  '@typescript/native-preview': '^7.0.0-dev.20260707.2',
  '@vitejs/plugin-react': '^4.7.0',
  '@vitest/coverage-v8': '^3.2.4',
  commander: '14.0.2',
  fastify: '^5.6.2',
  jsdom: '^25.0.0',
  oxlint: '^1.74.0',
  'pino-pretty': '^13.1.3',
  prettier: '^3.6.2',
  react: '^18.3.1',
  'react-dom': '^18.3.1',
  'styled-components': '^6.1.13',
  tsdown: '^0.22.12',
  tsx: '^4.21.0',
  turbo: '^2.5.4',
  vite: '^5.4.2',
  vitest: '^3.2.4',
};

export const CATALOG_VERSION = 'catalog:';

/**
 * Creates a dependency that resolves its version from the workspace catalog.
 *
 * @throws if `name` has no entry in {@link CATALOG}.
 */
export function catalogDependency(name: string): Dependency {
  if (!(name in CATALOG)) {
    throw new Error(`No catalog entry for dependency "${name}".`);
  }

  return new Dependency(name, CATALOG_VERSION);
}

/**
 * Renders the `catalog:` block for a generated `pnpm-workspace.yaml`, with
 * entries sorted by name.
 */
export function makeCatalogYaml(): string {
  const entries = Object.entries(CATALOG)
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(([name, version]) => `  ${quoteKey(name)}: ${version}`);

  return ['catalog:', ...entries].join('\n');
}

function quoteKey(name: string): string {
  return name.startsWith('@') ? `'${name}'` : name;
}
