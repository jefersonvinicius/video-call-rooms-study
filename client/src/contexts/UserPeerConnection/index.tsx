import { createContext, ReactNode, useContext, useRef } from 'react';

type UserPeerConnectionValue = {
  peerConnection: RTCPeerConnection;
};

const Context = createContext<UserPeerConnectionValue>({} as UserPeerConnectionValue);

const peerConnectionConfig = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export function UserPeerConnectionProvider({ children }: { children: ReactNode }) {
  const peerConnection = useRef(new RTCPeerConnection(peerConnectionConfig));

  return <Context.Provider value={{ peerConnection: peerConnection.current }}>{children}</Context.Provider>;
}

export function useUserPeerConnection() {
  return useContext(Context);
}
