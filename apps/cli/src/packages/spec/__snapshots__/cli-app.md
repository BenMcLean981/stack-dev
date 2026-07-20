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
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "prebuild": "pnpm check-types",
    "build": "tsup",
    "start": "node dist/index.mjs",
    "check-types": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier . --write",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "commander": "14.0.2"
  },
  "devDependencies": {
    "@acme/eslint-config": "workspace:*",
    "@acme/prettier-config": "workspace:*",
    "@acme/typescript-config": "workspace:*",
    "eslint": "^9.32.0",
    "prettier": "^3.6.2",
    "tsup": "^8.5.1",
    "tsx": "^4.21.0",
    "vitest": "^3.2.4"
  },
  "peerDependencies": {
    "@types/node": "^25.0.3",
    "typescript": "^5.9.3"
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

## tsup.config.ts

```
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  target: "esnext",
  platform: "node",
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".js",
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
