import React, { ReactNode } from 'react';
import styled from 'styled-components';

type Props = {
  onClick: () => void;
  children: ReactNode;
};

const Button = styled.button`
  border: none;
  border-radius: 50%;
  padding: 10px;
  width: max-content;
  aspect-ratio: 1 / 1;
  background-color: transparent;

  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }
`;

export default function IconButton({ children, onClick }: Props) {
  return <Button onClick={onClick}>{children}</Button>;
}
