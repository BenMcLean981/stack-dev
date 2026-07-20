# @stack-dev/cli

## 0.3.6

### Patch Changes

- e470a91: Fixed several generated packages that did not pass their own `turbo build`, `lint`, or `test` out of the box:

  - The `react` package templates imported `describe`/`it`/`expect` as globals (breaking `tsc`) and imported an unused `fireEvent`; they now import the test helpers from `vitest`.
  - The `fastify`, `vite`, and `react` templates failed `lint` on unused `request`/`reply` parameters, an unused `React` import, and a forbidden non-null assertion.
  - The `vite` template declared a `test` script and `vitest.config.ts` but never depended on `vitest`; `vitest` is now a devDependency.
  - The `cli`, `fastify`, and `vite` templates now set `passWithNoTests` so a freshly generated app passes `turbo test` before you add any tests.
  - The generated `fastify` app now honors a `PORT` environment variable instead of hard-coding port 3000.

- 953db58: Fixed `PackageJSON` dropping `peerDependencies` when adding or removing a dependency, and fixed `devDependencies` being sorted to the end of a formatted `package.json` instead of into its intended position.

## 0.3.5

### Patch Changes

- e741b66: Added missing dependency for UI package.

## 0.3.4

### Patch Changes

- 44abf97: Fixed linking and CLI node types.

## 0.3.3

### Patch Changes

- 68fb47b: Fixed package.json generation.

## 0.3.2

### Patch Changes

- 45ab108: Added License
- Updated dependencies [45ab108]
  - @stack-dev/core@0.2.1

## 0.3.1

### Patch Changes

- 61c03d1: Fixed bugs with workspace generation

## 0.3.0

### Minor Changes

- 97907ee: Added MIT license

### Patch Changes

- Updated dependencies [97907ee]
  - @stack-dev/core@0.2.0

## 0.2.0

### Minor Changes

- 7ceccc0: Added support for fastify and cli apps with commander.

## 0.1.7

### Patch Changes

- e4c692d: Test
- Updated dependencies [e4c692d]
  - @stack-dev/core@0.1.2

## 0.1.6

### Patch Changes

- 856180e: Added README.
- 34e106e: Setup CI
- Updated dependencies [34e106e]
  - @stack-dev/core@0.1.1
