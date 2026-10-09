## .oxlintrc.json

```
{
  "extends": [
    "../../configs/oxlint-config/base.oxlintrc.json",
    "../../configs/oxlint-config/react.oxlintrc.json"
  ],
  "ignorePatterns": ["**/dist/**", "**/coverage/**"]
}
```

## oxfmt.config.mts

```
import config from '@acme/oxfmt-config/react';

export default config;
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
    "dev": "tsdown --watch",
    "check-types": "tsc --noEmit",
    "lint": "oxlint",
    "format": "oxfmt .",
    "format:check": "oxfmt --check .",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@acme/oxfmt-config": "workspace:*",
    "@acme/oxlint-config": "workspace:*",
    "@acme/typescript-config": "workspace:*",
    "@testing-library/jest-dom": "catalog:",
    "@testing-library/react": "catalog:",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "@vitejs/plugin-react": "catalog:",
    "@vitest/coverage-v8": "catalog:",
    "jsdom": "catalog:",
    "oxfmt": "catalog:",
    "oxlint": "catalog:",
    "react": "catalog:",
    "react-dom": "catalog:",
    "tsdown": "catalog:",
    "typescript": "catalog:",
    "vitest": "catalog:"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "type": "module",
  "sideEffects": false
}
```

## src/button.spec.tsx

```
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Button } from './button';

describe('Button', () => {
  it('renders the label correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDefined();
  });

  it('is a button element', () => {
    render(<Button>Submit</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement.tagName).toBe('BUTTON');
  });
});
```

## src/button.tsx

```
import { HTMLAttributes, ReactElement } from 'react';

export function Button(props: HTMLAttributes<HTMLButtonElement>): ReactElement {
  return <button {...props} />;
}
```

## src/index.ts

```
export * from './button';
```

## tsconfig.json

```
{
  "extends": "@acme/typescript-config/tsconfig.react.json",
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
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    css: true,
  },
});
```
