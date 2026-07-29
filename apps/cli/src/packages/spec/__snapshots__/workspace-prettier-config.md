## base.mjs

```
/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  tabWidth: 2,
  singleQuote: true,
};

export default config;
```

## package.json

```
{
  "name": "@acme/prettier-config",
  "version": "0.1.0",
  "private": true,
  "peerDependencies": {
    "prettier": "^3.6.2"
  }
}
```
