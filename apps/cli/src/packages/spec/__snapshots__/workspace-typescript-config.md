## package.json

```
{
  "name": "@acme/typescript-config",
  "version": "0.1.0",
  "private": true,
  "devDependencies": {
    "@typescript/native-preview": "catalog:"
  },
  "files": [
    "*.json"
  ]
}
```

## tsconfig.base.json

```
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "noEmit": true,
    "types": []
  }
}
```

## tsconfig.node.json

```
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "lib": [
      "ES2022"
    ],
    "types": [
      "node"
    ]
  }
}
```

## tsconfig.react.json

```
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": [
      "DOM",
      "DOM.Iterable",
      "ES2022"
    ],
    "types": []
  }
}
```
