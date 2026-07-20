---
'@stack-dev/cli': patch
---

Fixed several generated packages that did not pass their own `turbo build`, `lint`, or `test` out of the box:

- The `react` package templates imported `describe`/`it`/`expect` as globals (breaking `tsc`) and imported an unused `fireEvent`; they now import the test helpers from `vitest`.
- The `fastify`, `vite`, and `react` templates failed `lint` on unused `request`/`reply` parameters, an unused `React` import, and a forbidden non-null assertion.
- The `vite` template declared a `test` script and `vitest.config.ts` but never depended on `vitest`; `vitest` is now a devDependency.
- The `cli`, `fastify`, and `vite` templates now set `passWithNoTests` so a freshly generated app passes `turbo test` before you add any tests.
- The generated `fastify` app now honors a `PORT` environment variable instead of hard-coding port 3000.
