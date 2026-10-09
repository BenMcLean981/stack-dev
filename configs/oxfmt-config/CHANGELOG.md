# @stack-dev/prettier-config

## 0.3.0

### Minor Changes

- 1b8bef2: Migrated the workspace and every generated package to TypeScript 7 and the oxc toolchain:

  - **Type checking** now uses TypeScript 7 (`typescript@7`, whose `tsc` is the native compiler) via `tsc --noEmit`. Workspaces now require Node >= 22.
  - **Linting** now uses `oxlint` in place of ESLint + `typescript-eslint`. The shared `@stack-dev/eslint-config` package (`base.mjs`/`react.mjs`) is replaced by `@stack-dev/oxlint-config` (`base.oxlintrc.json`/`react.oxlintrc.json`), and each package uses an `.oxlintrc.json` that extends it.
  - **Bundling** now uses `tsdown` (Rolldown/oxc) in place of `tsup`. Library packages enable `isolatedDeclarations` so declarations are emitted by Oxc, removing the need for the `typescript` package at build time.
  - `prettier-plugin-organize-imports` is dropped because it depends on the legacy `typescript` compiler. Formatting moved to `oxfmt` in the same release, whose built-in `sortImports` replaces it.

- 3411f8b: Replaced Prettier with oxfmt, completing the move to the oxc toolchain:

  - **Formatting** now uses `oxfmt` in place of Prettier. The shared `@stack-dev/prettier-config` package (`base.mjs`) is replaced by `@stack-dev/oxfmt-config`, which ships `base.ts` and `react.ts` built with oxfmt's `defineConfig`. Each package extends it from an `oxfmt.config.mts` that spreads the shared config, so per-package overrides compose the way the Prettier config did.
  - **Import sorting** is back: oxfmt's built-in `sortImports` replaces the `prettier-plugin-organize-imports` that had to be dropped when the workspace moved off the legacy `typescript` compiler.
  - Every package gains a `format:check` script (`oxfmt --check .`), wired into `turbo.json` and the CI matrix so formatting is enforced rather than merely available.
  - `printWidth` is pinned to 80 and `sortPackageJson` is disabled, preserving the previous Prettier line width and leaving `package.json` key order to the CLI, which already orders it deliberately.
  - Catalog bumps: `oxlint` 1.74 -> 1.86, `tsdown` 0.22 -> 0.23, `turbo` 2.5 -> 2.11.

  Fixed several defects in generated packages that the new `format:check` surfaced, all of which meant a freshly generated workspace did not satisfy its own formatter:

  - Generated `package.json`, `turbo.json`, `tsconfig.json`, and `pnpm-workspace.yaml` had no trailing newline.
  - The generated CLI app's `src/index.ts` had a doubled semicolon and used double quotes; the `fastify`, `vite`, and `tsdown` templates used double quotes throughout.
  - The `react` and `vite` templates had unsorted imports and trailing whitespace.
  - `stack link` rewrote `tsconfig.json` with every array expanded, which the formatter would then collapse. `TSConfig.format` now keeps short arrays inline.

## 0.2.1

### Patch Changes

- 45ab108: Added License

## 0.2.0

### Minor Changes

- 97907ee: Added MIT license

## 0.1.2

### Patch Changes

- e4c692d: Test

## 0.1.1

### Patch Changes

- 34e106e: Setup CI
