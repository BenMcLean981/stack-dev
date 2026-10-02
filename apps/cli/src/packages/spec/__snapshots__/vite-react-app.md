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

## index.html

```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + Stack-Dev</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
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
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "start": "pnpm run preview",
    "check-types": "tsc --noEmit",
    "lint": "oxlint",
    "format": "oxfmt .",
    "format:check": "oxfmt --check .",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "catalog:",
    "react-dom": "catalog:"
  },
  "devDependencies": {
    "@acme/oxfmt-config": "workspace:*",
    "@acme/oxlint-config": "workspace:*",
    "@acme/typescript-config": "workspace:*",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "@vitejs/plugin-react": "catalog:",
    "oxfmt": "catalog:",
    "oxlint": "catalog:",
    "typescript": "catalog:",
    "vite": "catalog:",
    "vitest": "catalog:"
  },
  "type": "module"
}
```

## src/App.tsx

```
import { useState } from 'react';

export function App() {
  const [count, setCount] = useState(0);

  return (
    <div
      style={{
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
      }}
    >
      <h1>Stack-Dev App</h1>
      <div className='card'>
        <button
          onClick={function () {
            setCount(count + 1);
          }}
        >
          Count is {count}
        </button>
      </div>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
    </div>
  );
}
```

## src/main.tsx

```
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element "#root" was not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

## tsconfig.json

```
{
  "extends": "@acme/typescript-config/tsconfig.react.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

## vite.config.ts

```
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
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
