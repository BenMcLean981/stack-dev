import { FileGeneratorImp } from '../../../../file-generator/file-generator-imp';

const BUTTON = `import { HTMLAttributes, ReactElement } from 'react';

export function Button(props: HTMLAttributes<HTMLButtonElement>): ReactElement {
  return <button {...props} />;
}
`;

export const BUTTON_FILE_GENERATOR = new FileGeneratorImp(
  'src/button.tsx',
  BUTTON,
);
