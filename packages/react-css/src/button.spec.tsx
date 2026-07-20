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

  /* Note: Testing for specific CSS classes with CSS Modules is tricky
     because class names are mangled (e.g., _styledButton_123).
     Usually, we just test that the class attribute exists.
  */
  it('applies a class name', () => {
    render(<Button>Styled</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement.className).toBeTruthy();
  });
});
