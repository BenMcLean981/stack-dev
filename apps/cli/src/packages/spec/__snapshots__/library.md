## eslint.config.mjs

```
import base from '@acme/eslint-config/base.mjs';

export default [...base, { ignores: ['**/dist/**'] }];
```

## package.json

```
{
  "name": "@acme/widget",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "development": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "scripts": {
    "prebuild": "pnpm check-types",
    "build": "tsup",
    "check-types": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier . --write",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@acme/eslint-config": "workspace:*",
    "@acme/prettier-config": "workspace:*",
    "@acme/typescript-config": "workspace:*",
    "@vitest/coverage-v8": "catalog:",
    "eslint": "catalog:",
    "prettier": "catalog:",
    "prettier-plugin-organize-imports": "catalog:",
    "tsup": "catalog:",
    "vitest": "catalog:"
  },
  "type": "module",
  "sideEffects": false
}
```

## prettier.config.mjs

```
import base from '@acme/prettier-config/base.mjs';

export default base;
```

## src/add.ts

```
export function add(n1: number, n2: number): number {
  return n1 + n2;
}
```

## src/index.ts

```
export * from './add';
```

## src/spec/add.spec.ts

```
import { describe, it, expect } from 'vitest';

import { add } from '../add';

describe('add', () => {
  it('adds two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
});
```

## tsconfig.json

```
{
  "extends": "@acme/typescript-config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

## tsup.config.ts

```
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'esnext',
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js',
    };
  },
});
```

## vitest.config.ts

```
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
    },
    environment: 'node',
  },
});
```
