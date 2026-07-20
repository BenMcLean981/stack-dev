## eslint.config.mjs

```
import base from '@acme/eslint-config/base.mjs';
import react from '@acme/eslint-config/react.mjs';

export default [
  ...base,
  ...react,
  { 
    ignores: ['**/dist/**', '**/coverage/**'] 
  }
];
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
    "lint": "eslint .",
    "format": "prettier . --write",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@acme/eslint-config": "workspace:*",
    "@acme/prettier-config": "workspace:*",
    "@acme/typescript-config": "workspace:*",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.1",
    "eslint": "^9.32.0",
    "prettier": "^3.6.2",
    "typescript": "^5.5.4",
    "vite": "^5.4.2",
    "vitest": "^3.2.4"
  },
  "type": "module"
}
```

## prettier.config.mjs

```
import base from '@acme/prettier-config/base.mjs';

export default base;
```

## src/App.tsx

```
import { useState } from 'react';

export function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui, sans-serif',
      textAlign: 'center'
    }}>
      <h1>Stack-Dev App</h1>
      <div className="card">
        <button onClick={function() { setCount(count + 1) }}>
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
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
