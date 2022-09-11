import React from 'react';
import { useRoom } from 'queries/rooms';
import { useParams } from 'react-router-dom';

export default function WaitingRoom() {
  const { roomId } = useParams();

  const { room } = useRoom({ roomId });

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
    </div>
  );
}
