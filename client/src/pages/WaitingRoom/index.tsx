import React from 'react';
import { useRoom } from 'modules/rooms/hooks/queries';
import { useConfigureUser } from 'modules/users/hooks';
import { useParams } from 'react-router-dom';
import { useUserSocket } from 'contexts/UserSocketContext';

export default function WaitingRoom() {
  const { roomId } = useParams();

  const { user } = useConfigureUser();
  const { getSocket } = useUserSocket();
  const { room } = useRoom({ roomId });

  function handleJoinClick() {
    getSocket()?.emit('join-room', { roomId }, () => {
      console.log('Joined!!');
    });
  }

  return (
    <div>
      Room: {room?.id}
      <hr />
      <h3>Users</h3>
      <ul>
        {room?.users.map((user) => {
          return <li key={user.id}>{user.id}</li>;
        })}
      </ul>
      <button onClick={handleJoinClick} disabled={!user}>
        Join
      </button>
    </div>
  );
}
