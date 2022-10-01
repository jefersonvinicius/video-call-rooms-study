import { THEME } from 'config/theme';
import styled from 'styled-components';

export const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  & > form {
    display: flex;
    flex-direction: column;

    & > input {
      border: none;
      text-align: center;
      outline: none;
      padding: 5px;
      font-size: 24px;
    }

    & > button {
      border: none;
      padding: 10px;
      background-color: ${THEME.COLOR.PRIMARY};
      color: #fff;
      font-size: 16px;
      font-weight: bold;

      &:hover {
        cursor: pointer;
      }
    }
  }
`;
