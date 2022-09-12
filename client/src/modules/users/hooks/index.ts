import { API } from 'services/api';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { User } from '..';
import { useUserState } from '../state';

export function useCreateUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    API.Users.create().then(setUser);
  }, []);

  return { user };
}

export function useConfigureUser() {
  const [user, setUser] = useUserState();

  useEffect(() => {
    API.Users.create().then((userCreated) => {
      const socket = io('http://localhost:3333');
      socket.on('connect', () => {
        socket.emit('set-user-info', { userId: userCreated.id }, () => {
          userCreated.socket = socket;
          setUser(userCreated);
        });
      });
    });
  }, [setUser]);

  return { user };
}
