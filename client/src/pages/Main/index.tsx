import React from 'react';
import { API } from 'services/api';
import { useNavigate } from 'react-router-dom';
import { useUserSocket } from 'contexts/UserSocketContext';
import { useUser } from 'modules/users/state';

export default function MainPage() {
  const user = useUser();
  const { isConnecting } = useUserSocket();
  const navigate = useNavigate();

  async function handleCreateRoomClick() {
    const room = await API.Rooms.create();
    navigate(`/rooms/${room.id}`);
  }

  return (
    <div className="App">
      <div>
        <div>
          <strong>{user?.name}</strong>
        </div>
        <small>{user?.id}</small>
      </div>
      <button onClick={handleCreateRoomClick} disabled={isConnecting}>
        Create Room
      </button>
    </div>
  );
}
