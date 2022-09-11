import React, { useEffect, useState } from 'react';
import { API } from 'api';
import { User } from 'entities/user';
import { useNavigate } from 'react-router-dom';
import { configureUserIdHeaderInterceptor, removeRequestInterceptor } from 'api/interceptors';

function useCreateUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    API.Users.create().then(setUser);
  }, []);

  return { user };
}

export default function MainPage() {
  const { user } = useCreateUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const interceptorId = configureUserIdHeaderInterceptor(user?.id);
    return () => {
      removeRequestInterceptor(interceptorId);
    };
  }, [user]);

  async function handleCreateRoomClick() {
    const room = await API.Rooms.create();
    navigate(`/rooms/${room.id}`);
  }

  return (
    <div className="App">
      <p>Your ID: {user?.id}</p>
      <button onClick={handleCreateRoomClick}>Create Room</button>
    </div>
  );
}
