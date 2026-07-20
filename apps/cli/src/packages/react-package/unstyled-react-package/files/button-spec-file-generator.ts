import { FileGeneratorImp } from '../../../../file-generator/file-generator-imp';

const BUTTON_SPEC = `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders the label correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDefined();
  });

  it('is a button element', () => {
    render(<Button>Submit</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement.tagName).toBe('BUTTON');
  });
});
`;

export const BUTTON_SPEC_FILE_GENERATOR = new FileGeneratorImp(
  'src/button.spec.tsx',
  BUTTON_SPEC,
);
