## .oxlintrc.json

```
{
  "extends": ["../../configs/oxlint-config/base.oxlintrc.json"],
  "ignorePatterns": ["**/dist/**"]
}
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
    "build": "tsdown",
    "check-types": "tsc --noEmit",
    "lint": "oxlint",
    "format": "prettier . --write",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@acme/oxlint-config": "workspace:*",
    "@acme/prettier-config": "workspace:*",
    "@acme/typescript-config": "workspace:*",
    "@vitest/coverage-v8": "catalog:",
    "oxlint": "catalog:",
    "prettier": "catalog:",
    "tsdown": "catalog:",
    "typescript": "catalog:",
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
    "outDir": "dist",
    "declaration": true,
    "isolatedDeclarations": true
  },
  "include": ["src"]
}
```

## tsdown.config.ts

```
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  outExtensions({ format }) {
    return {
      js: format === 'es' ? '.mjs' : '.js',
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
