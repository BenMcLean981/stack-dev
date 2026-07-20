import { FileGeneratorImp } from '../../../file-generator/file-generator-imp';

const APP = `import { useState } from 'react';

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
`;

export const APP_FILE_GENERATOR = new FileGeneratorImp('src/App.tsx', APP);
