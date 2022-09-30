import { useEffect } from 'react';
import { API } from 'services/api';
import { useUserState } from '../state';

export function useConfigureUser() {
  const [user, setUser] = useUserState();

  useEffect(() => {
    let mounted = true;
    API.Users.create('').then((created) => {
      if (mounted) setUser(created);
    });

    return () => {
      mounted = false;
    };
  }, [setUser]);

  return { user };
}
