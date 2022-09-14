import { useUserSocket } from 'contexts/UserSocketContext';
import { useUser } from 'modules/users/state';
import { useEffect, useRef } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

export const Video = styled.video`
  width: 100px;
  height: 100px;
`;

export default function RoomPage() {
  const { roomId } = useParams();
  const user = useUser();
  const { getSocket, errorOnConnect, isConnectionLost } = useUserSocket();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    let mediaRecorder: MediaRecorder | null = null;
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.addEventListener('dataavailable', handleDataAvailable);
        mediaRecorder.addEventListener('stop', handleStopRecorder);
        mediaRecorder.start(1000);
      }
    });

    function handleJoinedUser(user: any) {
      console.log(`User ${user.name} joined in room`);
    }

    function handleDataAvailable(event: BlobEvent) {
      console.log('sending data: ', event.data);
      socket?.emit('stream-video', event.data);
    }

    function handleStopRecorder() {
      console.log('Stopping on server');
      socket?.emit('stop-stream-video');
    }

    return () => {
      mediaRecorder?.stream.getTracks().forEach((track) => track.stop());
      mediaRecorder?.stop();
      socket.off('joined-user', handleJoinedUser);
    };
  }, [getSocket, user]);

  const link = `${window.location.origin}/waiting-room/${roomId}`;

  async function handleCopyLink() {
    await navigator.clipboard.writeText(link);
  }

  if (!getSocket()) return <Navigate to="/" replace />;

  return (
    <div className="App">
      <p>Room ID: {roomId}</p>
      <p>
        Share: {link}
        <button onClick={handleCopyLink}>Copy</button>
      </p>
      {isConnectionLost && <p>Connection lost, trying to reconnect...</p>}
      {errorOnConnect && <p>Error on connect: {errorOnConnect?.message}</p>}
      <Video ref={videoRef} autoPlay />
    </div>
  );
}
