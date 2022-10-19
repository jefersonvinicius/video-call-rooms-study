import { User } from 'modules/users';
import React from 'react';
import styled from 'styled-components';

export const Container = styled.div`
  flex: 1;
  position: relative;
`;

export const Video = styled.video`
  width: 100%;
  height: 100%;
`;

export const Info = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding: 10px;

  & > span {
    color: #fff;
    font-size: 24px;
  }
`;

type Props = {
  videoRef?: React.RefObject<HTMLVideoElement> | ((instance: HTMLVideoElement | null) => void);
  user: User;
  currentUser: User;
};

export default function VideoCall({ videoRef, user, currentUser }: Props) {
  return (
    <Container>
      <Video ref={videoRef} autoPlay />
      <Info>
        <span>{user.id === currentUser.id ? 'You' : user.name}</span>
      </Info>
    </Container>
  );
}
