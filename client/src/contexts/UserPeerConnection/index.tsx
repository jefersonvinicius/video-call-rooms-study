import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

type UserPeerConnectionValue = {
  peerConnection: RTCPeerConnection;
  rawStreams: MediaStream[];
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

  const [rawStreams, setRawStreams] = useState<MediaStream[]>([]);

  useEffect(() => {
    peerConnection.current.ontrack = (event) => {
      console.log('ON TRACK', event);
      setRawStreams([...event.streams]);
    };

    peerConnection.current.onconnectionstatechange = (event) => {
      console.log('onconnectionstatechange: ', event);
    };
  }, []);

  return <Context.Provider value={{ peerConnection: peerConnection.current, rawStreams }}>{children}</Context.Provider>;
}

export function useUserPeerConnection() {
  return useContext(Context);
}
