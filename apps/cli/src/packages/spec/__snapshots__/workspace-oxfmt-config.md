## base.ts

```
import { defineConfig } from 'oxfmt';

/**
 * @see https://oxc.rs/docs/guide/usage/formatter
 */
export default defineConfig({
  tabWidth: 2,
  printWidth: 80,
  singleQuote: true,
  sortImports: true,
  // The CLI owns package.json key and dependency ordering (see
  // PackageJSON.format), so the formatter must not re-sort it.
  sortPackageJson: false,
  ignorePatterns: ['**/__snapshots__/**', '**/dist/**', '**/coverage/**'],
});
```

## package.json

```
{
  "name": "@acme/oxfmt-config",
  "version": "0.1.0",
  "private": true,
  "exports": {
    "./base": "./base.ts",
    "./react": "./react.ts"
  },
  "devDependencies": {
    "oxfmt": "catalog:"
  },
  "type": "module",
  "files": [
    "*.ts"
  ]
}
```

## react.ts

```
import { defineConfig } from 'oxfmt';

import base from './base.ts';

export default defineConfig({
  ...base,
  jsxSingleQuote: true,
});
```
