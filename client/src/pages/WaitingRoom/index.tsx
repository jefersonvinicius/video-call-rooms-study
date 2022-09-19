import React from 'react';
import { useWaitingRoomQuery } from 'modules/rooms/hooks/queries';
import { useConfigureUser } from 'modules/users/hooks';
import { useParams } from 'react-router-dom';
import { useUserSocket } from 'contexts/UserSocketContext';
import { useUserPeerConnection } from 'contexts/UserPeerConnection';

export default function WaitingRoom() {
  const { roomId } = useParams();
  const { user } = useConfigureUser();
  const { getSocket } = useUserSocket();
  const { peerConnection } = useUserPeerConnection();
  const { room } = useWaitingRoomQuery({ roomId });
  // const navigate = useNavigate();

  async function handleJoinClick() {
    peerConnection!.onicecandidate = (event) => {
      console.log('onicecandidate');
      console.log(event.candidate);
    };

    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    const socket = getSocket();
    socket?.on('answer', ({ roomId, answer }) => {
      console.log('ANSWER: ', roomId, answer);
      console.log(peerConnection.currentRemoteDescription);
      const answerDescription = new RTCSessionDescription(answer);
      peerConnection.setRemoteDescription(answerDescription);
    });
    socket?.emit('offer', { roomId, offer });
    // () => {
    //   console.log('Joined!!');
    //   navigate(`/rooms/${roomId}`, { replace: true });
    // }
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
