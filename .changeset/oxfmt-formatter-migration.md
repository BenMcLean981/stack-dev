---
'@stack-dev/react-styled-components': minor
'@stack-dev/oxfmt-config': minor
'@stack-dev/oxlint-config': minor
'@stack-dev/react-css': minor
'@stack-dev/core': minor
'@stack-dev/cli': minor
---

Replaced Prettier with oxfmt, completing the move to the oxc toolchain:

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
