import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

type UserMediaValue = {
  userMedia: MediaStream | null;
  setUserMedia: (media: MediaStream) => void;
};

const Context = createContext<UserMediaValue>({} as UserMediaValue);

export function UserMediaProvider({ children }: { children: ReactNode }) {
  const [userMedia, setUserMediaState] = useState<MediaStream | null>(null);

  const setUserMedia = useCallback((media: MediaStream) => {
    setUserMediaState(media);
  }, []);

  return <Context.Provider value={{ userMedia: userMedia, setUserMedia }}>{children}</Context.Provider>;
}

export function useUserMedia() {
  return useContext(Context);
}
