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
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "prebuild": "pnpm check-types",
    "build": "tsdown",
    "start": "node dist/index.mjs",
    "check-types": "tsgo --noEmit",
    "lint": "oxlint",
    "format": "prettier . --write",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "commander": "catalog:"
  },
  "devDependencies": {
    "@acme/oxlint-config": "workspace:*",
    "@acme/prettier-config": "workspace:*",
    "@acme/typescript-config": "workspace:*",
    "@types/node": "catalog:",
    "@typescript/native-preview": "catalog:",
    "oxlint": "catalog:",
    "prettier": "catalog:",
    "tsdown": "catalog:",
    "tsx": "catalog:",
    "vitest": "catalog:"
  },
  "type": "module"
}
```

## prettier.config.mjs

```
import base from '@acme/prettier-config/base.mjs';

export default base;
```

## src/index.ts

```
import { Command } from "commander";;

const program = new Command();

program
  .name('string-util')
  .description('CLI to some JavaScript string utilities')
  .version('0.8.0');

program.command('split')
  .description('Split a string into substrings and display as an array')
  .argument('<string>', 'string to split')
  .option('--first', 'display just the first substring')
  .option('-s, --separator <char>', 'separator character', ',')
  .action((str, options) => {
    const limit = options.first ? 1 : undefined;
    console.log(str.split(options.separator, limit));
  });

program.parse();
```

## tsconfig.json

```
{
  "extends": "@acme/typescript-config/tsconfig.base.json",
  "compilerOptions": {
    "types": ["node"],
    "outDir": "dist"
  },
  "include": ["src"]
}
```

## tsdown.config.ts

```
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  platform: "node",
  outExtensions({ format }) {
    return {
      js: format === "es" ? ".mjs" : ".js",
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
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
    },
    environment: 'node',
  },
});
```
