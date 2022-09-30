import React, { useEffect, useRef } from 'react';
import { useWaitingRoomQuery } from 'modules/rooms/hooks/queries';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserSocket } from 'contexts/UserSocketContext';
import { useUserPeerConnection } from 'contexts/UserPeerConnection';
import { useUserMedia } from 'contexts/UserMedia';
import { useUser } from 'modules/users/state';

export default function WaitingRoom() {
  const { roomId } = useParams();
  const user = useUser();
  const { getSocket } = useUserSocket();
  const { peerConnection } = useUserPeerConnection();
  const { userMedia, setUserMedia } = useUserMedia();
  const { room } = useWaitingRoomQuery({ roomId });

  const preview = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((media) => {
      setUserMedia(media);
      preview.current!.srcObject = media;
    });
  }, [setUserMedia]);

  const navigate = useNavigate();

  async function handleJoinClick() {
    const socket = getSocket();

    socket?.on('answer-candidate', async (params: { candidate?: RTCIceCandidate }) => {
      console.log('answer-candidate', params);
      if (params.candidate) await peerConnection.addIceCandidate(params.candidate);
    });

    userMedia?.getTracks().forEach((track) => {
      peerConnection.addTrack(track);
    });

    peerConnection.addEventListener('icecandidate', handleOnIceCandidate);

    function handleOnIceCandidate(event: RTCPeerConnectionIceEvent) {
      console.log('waiting room onicecandidate: ', event);
      if (!event.candidate) return;

      socket?.emit('offer-candidate', { roomId, candidate: event.candidate.toJSON() });
    }

    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    socket?.on('answer', async ({ roomId, answer }) => {
      console.log('ANSWER: ', roomId, answer);
      const answerDescription = new RTCSessionDescription(answer);
      await peerConnection.setRemoteDescription(answerDescription);

      peerConnection.removeEventListener('icecandidate', handleOnIceCandidate);

      navigate(`/rooms/${roomId}`);
    });
    socket?.emit('offer', { roomId, offer });
  }

  return (
    <div>
      Room: {room?.id}
      <hr />
      <h3>Users</h3>
      <ul>
        {room?.users.map((user) => {
          return (
            <li key={user.id}>
              <span>{user.name} - </span>
              <small>({user.id})</small>
            </li>
          );
        })}
      </ul>
      <video ref={preview} autoPlay />
      <button onClick={handleJoinClick} disabled={!user || !userMedia}>
        Join
      </button>
    </div>
  );
}
