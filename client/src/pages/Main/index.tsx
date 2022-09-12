import React, { useEffect } from 'react';
import { API } from 'api';
import { useNavigate } from 'react-router-dom';
import { configureUserIdHeaderInterceptor, removeRequestInterceptor } from 'api/interceptors';
import { useCreateUser } from 'modules/users/hooks';

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
