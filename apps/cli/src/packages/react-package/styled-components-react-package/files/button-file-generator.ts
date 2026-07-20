import { FileGeneratorImp } from '../../../../file-generator/file-generator-imp';

const BUTTON = `import { HTMLAttributes } from 'react';
import styled from 'styled-components';

// This is your "Styled" version of the button
// No more imports, no more "empty objects"
const StyledButton = styled.button\`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #0056b3;
  }
\`;

export function Button(props: HTMLAttributes<HTMLButtonElement>) {
  return <StyledButton {...props} />;
}
`;

export const BUTTON_FILE_GENERATOR = new FileGeneratorImp(
  'src/button.tsx',
  BUTTON,
);
