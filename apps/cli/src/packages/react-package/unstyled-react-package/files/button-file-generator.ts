import { FileGeneratorImp } from '../../../../file-generator/file-generator-imp';

const BUTTON = `import { HTMLAttributes } from 'react';

export function Button(props: HTMLAttributes<HTMLButtonElement>) {
  return <button {...props} />;
}
`;

export const BUTTON_FILE_GENERATOR = new FileGeneratorImp(
  'src/button.tsx',
  BUTTON,
);
