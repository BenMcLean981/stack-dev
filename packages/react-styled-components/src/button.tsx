import { HTMLAttributes, ReactElement } from 'react';

import styled from 'styled-components';

const StyledButton = styled.button`
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
`;

export function Button(props: HTMLAttributes<HTMLButtonElement>): ReactElement {
  return <StyledButton {...props} />;
}
