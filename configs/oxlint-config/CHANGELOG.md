# @stack-dev/oxlint-config

## 0.3.0

### Minor Changes

- 1b8bef2: Migrated the workspace and every generated package to TypeScript 7 and the oxc toolchain:

  - **Type checking** now uses TypeScript 7 (`typescript@7`, whose `tsc` is the native compiler) via `tsc --noEmit`. Workspaces now require Node >= 22.
  - **Linting** now uses `oxlint` in place of ESLint + `typescript-eslint`. The shared `@stack-dev/eslint-config` package (`base.mjs`/`react.mjs`) is replaced by `@stack-dev/oxlint-config` (`base.oxlintrc.json`/`react.oxlintrc.json`), and each package uses an `.oxlintrc.json` that extends it.
  - **Bundling** now uses `tsdown` (Rolldown/oxc) in place of `tsup`. Library packages enable `isolatedDeclarations` so declarations are emitted by Oxc, removing the need for the `typescript` package at build time.
  - `prettier-plugin-organize-imports` is dropped because it depends on the legacy `typescript` compiler; Prettier is still used for formatting.

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
