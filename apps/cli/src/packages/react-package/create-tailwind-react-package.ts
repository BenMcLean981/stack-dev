import { FileGeneratorImp } from "../../file-generator/file-generator-imp";

export async function createTailwindReactPackage(): Promise<void> {
  throw new Error('Not implemented.');
}

const STYLED_BUTTON = `import React from 'react';

interface ButtonProps {
  label: string;
  onClick?: () => void; 
}

export function TailwindButton(props: ButtonProps) {
  const {label, onClick} = props;
    
  return (
    <button 
      onClick={onClick}
      className="my-lib-bg-blue-600 my-lib-text-white my-lib-p-[10px] my-lib-border-none my-lib-rounded my-lib-cursor-pointer hover:my-lib-brightness-110"
    >
      {label}
    </button>
  );
};`;

export const STYLED_BUTTON_FILE_GENERATOR = new FileGeneratorImp(
  'styled-button.ts',
  STYLED_BUTTON,
);
