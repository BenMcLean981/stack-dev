## base.mjs

```
/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  tabWidth: 2,
  singleQuote: true,
  plugins: [import.meta.resolve("prettier-plugin-organize-imports")],
};

export default config;
```

## package.json

```
{
  "name": "@acme/prettier-config",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "prettier-plugin-organize-imports": "catalog:"
  },
  "peerDependencies": {
    "prettier": "^3.6.2"
  }
}
```
