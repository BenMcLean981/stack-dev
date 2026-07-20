---
'@stack-dev/react-styled-components': minor
'@stack-dev/typescript-config': minor
'@stack-dev/react-css': minor
'@stack-dev/prettier-config': minor
'@stack-dev/oxlint-config': minor
'@stack-dev/core': minor
'@stack-dev/cli': minor
---

Migrated the workspace and every generated package to TypeScript 7 and the oxc toolchain:

- **Type checking** now uses TypeScript 7 (`typescript@7`, whose `tsc` is the native compiler) via `tsc --noEmit`. Workspaces now require Node >= 22.
- **Linting** now uses `oxlint` in place of ESLint + `typescript-eslint`. The shared `@stack-dev/eslint-config` package (`base.mjs`/`react.mjs`) is replaced by `@stack-dev/oxlint-config` (`base.oxlintrc.json`/`react.oxlintrc.json`), and each package uses an `.oxlintrc.json` that extends it.
- **Bundling** now uses `tsdown` (Rolldown/oxc) in place of `tsup`. Library packages enable `isolatedDeclarations` so declarations are emitted by Oxc, removing the need for the `typescript` package at build time.
- `prettier-plugin-organize-imports` is dropped because it depends on the legacy `typescript` compiler; Prettier is still used for formatting.
