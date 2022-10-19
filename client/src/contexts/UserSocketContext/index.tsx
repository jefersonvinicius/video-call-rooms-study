import { useUser } from 'modules/users/state';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { io, Socket } from 'socket.io-client';

type UserSocketContextValue = {
  getSocket: () => Socket | null;
  isConnectionLost: boolean;
  errorOnConnect: any | null;
  isConnecting: boolean;
  setMediaStreamId: (streamId: string) => void;
};

const Context = createContext<UserSocketContextValue>({
  getSocket: () => null,
  isConnectionLost: false,
  errorOnConnect: null,
  isConnecting: false,
  setMediaStreamId: () => {},
});

export function UserSocketProvider({ children }: { children: ReactNode }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectionLost, setIsConnectionLost] = useState(false);
  const [errorOnConnect, setErrorOnConnect] = useState<any | null>(null);
  const socket = useRef<Socket | null>(null);
  const user = useUser();

  useEffect(() => {
    if (!user) return;

    const socketInstance = io(process.env.REACT_APP_BASE_API_URL!, {
      extraHeaders: { 'ngrok-skip-browser-warning': 'yes' },
    });

    setErrorOnConnect(null);
    setIsConnectionLost(false);
    setIsConnecting(true);
    socketInstance.on('connect', () => {
      socketInstance.emit('set-user-info', { userId: user.id }, () => {
        socket.current = socketInstance;
        setIsConnecting(false);
      });
    });

    socketInstance.on('disconnect', (reason: string) => {
      console.log('disconnect because of ' + reason);
      if (['io server disconnect', 'transport close'].includes(reason)) {
        setIsConnectionLost(true);
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.log('connect error with ' + error);
      setErrorOnConnect(error);
      setIsConnecting(false);
    });
  }, [user]);

  const getSocket = useCallback(() => {
    return socket.current;
  }, []);

  const setMediaStreamId = useCallback(
    (value: string) => {
      getSocket()?.emit('set-stream-id', { streamId: value });
    },
    [getSocket]
  );

  return (
    <Context.Provider value={{ getSocket, isConnectionLost, errorOnConnect, isConnecting, setMediaStreamId }}>
      {children}
    </Context.Provider>
  );
}

export function useUserSocket() {
  return useContext(Context);
}
