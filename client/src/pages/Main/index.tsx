import React from 'react';
import { API } from 'services/api';
import { useNavigate } from 'react-router-dom';
import { useConfigureUser } from 'modules/users/hooks';
import { useUserSocket } from 'contexts/UserSocketContext';

export default function MainPage() {
  const { user } = useConfigureUser();
  const { isConnecting } = useUserSocket();
  const navigate = useNavigate();

  async function handleCreateRoomClick() {
    const room = await API.Rooms.create();
    navigate(`/rooms/${room.id}`);
  }

  return (
    <div className="App">
      <p>Your ID: {user?.id}</p>
      <button onClick={handleCreateRoomClick} disabled={isConnecting}>
        Create Room
      </button>
    </div>
  );
}
