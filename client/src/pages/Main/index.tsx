import React, { useEffect, useState } from 'react';
import { API } from 'api';
import { User } from 'entities/user';
import { useNavigate } from 'react-router-dom';

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
