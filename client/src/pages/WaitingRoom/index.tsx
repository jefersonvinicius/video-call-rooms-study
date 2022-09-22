import React, { useEffect, useRef } from 'react';
import { useWaitingRoomQuery } from 'modules/rooms/hooks/queries';
import { useConfigureUser } from 'modules/users/hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserSocket } from 'contexts/UserSocketContext';
import { useUserPeerConnection } from 'contexts/UserPeerConnection';
import { useUserMedia } from 'contexts/UserMedia';

export default function WaitingRoom() {
  const { roomId } = useParams();
  const { user } = useConfigureUser();
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
    // userMedia?.getTracks().forEach((track) => {
    //   peerConnection.addTrack(track);
    // });

    peerConnection!.onicecandidate = (event) => {
      if (!event.candidate) return;

      socket?.emit('offer-candidate', { roomId, candidate: event.candidate.toJSON() });
    };

    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    const socket = getSocket();
    socket?.on('answer', async ({ roomId, answer }) => {
      console.log('ANSWER: ', roomId, answer);
      const answerDescription = new RTCSessionDescription(answer);
      await peerConnection.setRemoteDescription(answerDescription);
      navigate(`/rooms/${roomId}`);
    });
    socket?.emit('offer', { roomId, offer });

    socket?.on('answer-candidate', (params: { candidate?: RTCIceCandidate }) => {
      console.log('answer-candidate', params);
      if (params.candidate) peerConnection.addIceCandidate(params.candidate);
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
      <video ref={preview} autoPlay />
      <button onClick={handleJoinClick} disabled={!user || !userMedia}>
        Join
      </button>
    </div>
  );
}
