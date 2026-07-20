## base.oxlintrc.json

```
{
  "plugins": ["typescript", "unicorn", "oxc"],
  "categories": {
    "correctness": "error"
  },
  "rules": {
    "typescript/array-type": ["error", { "default": "generic" }],
    "typescript/consistent-type-definitions": "off",
    "typescript/class-literal-property-style": ["error", "getters"]
  }
}
```

## package.json

```
{
  "name": "@acme/oxlint-config",
  "version": "0.1.0",
  "private": true,
  "devDependencies": {
    "oxlint": "catalog:"
  },
  "files": [
    "*.oxlintrc.json"
  ]
}
```

## react.oxlintrc.json

```
{
  "plugins": ["typescript", "unicorn", "oxc", "react"],
  "categories": {
    "correctness": "error"
  }
}
```
