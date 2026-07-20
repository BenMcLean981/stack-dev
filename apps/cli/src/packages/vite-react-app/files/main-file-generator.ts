import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const MAIN = `import { StrictMode } from 'react';
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
`;

export const MAIN_FILE_GENERATOR = new FileGeneratorImp('src/main.tsx', MAIN);
