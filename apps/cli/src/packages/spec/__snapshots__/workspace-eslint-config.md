## base.mjs

```
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    rules: {
      "@typescript-eslint/array-type": ["error", { default: "generic" }],
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/class-literal-property-style": ["error", "getters"],
    },
  }
);
```

## package.json

```
{
  "name": "@acme/eslint-config",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@eslint/js": "catalog:",
    "eslint-plugin-react": "catalog:",
    "typescript-eslint": "catalog:"
  },
  "peerDependencies": {
    "eslint": "^9.32.0",
    "typescript": "^5.8.3"
  }
}
```

## react.mjs

```
import eslint from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  }
);
```
