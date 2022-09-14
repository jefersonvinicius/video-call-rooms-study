import { useUserSocket } from 'contexts/UserSocketContext';
import { useRoomQuery } from 'modules/rooms/hooks/queries';
import { User } from 'modules/users';
import { useUser } from 'modules/users/state';
import { useEffect, useMemo, useRef } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { isForbiddenError } from 'services/api/errors';
import styled from 'styled-components';

export const Video = styled.video`
  width: 100px;
  height: 100px;
`;

export default function RoomPage() {
  const { roomId } = useParams();
  const { room, errorOnRoomQuery, isLoadingRoom, refetchRoom } = useRoomQuery({ roomId });
  const currentUser = useUser();
  const { getSocket, errorOnConnect, isConnectionLost } = useUserSocket();
  const videoRef = useRef<HTMLVideoElement>(null);

  console.log({ errorOnRoomQuery });

  const others = useMemo(() => {
    return room?.users.filter((u) => u.id !== currentUser?.id);
  }, [room?.users, currentUser?.id]);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  useEffect(() => {
    return () => {
      mediaRecorder.current?.stream.getTracks().forEach((track) => track.stop());
      mediaRecorder.current?.stop();
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || errorOnRoomQuery || isLoadingRoom || mediaRecorder.current?.state === 'recording') return;

    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.addEventListener('dataavailable', handleDataAvailable);
        mediaRecorder.current.addEventListener('stop', handleStopRecorder);
        mediaRecorder.current.start(1000);
      }
    });

    socket.on('joined-user', handleJoinedUser);
    socket.on('stream-video', (args) => {
      console.log('ARGS: ', args);
    });

    function handleJoinedUser({ user }: { user: User }) {
      console.log({ user });
      console.log(`User ${user.id} joined in room`);
      refetchRoom();
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
      socket.off('joined-user', handleJoinedUser);
    };
  }, [errorOnRoomQuery, getSocket, isLoadingRoom, room, currentUser, refetchRoom]);

  const link = `${window.location.origin}/waiting-room/${roomId}`;

  async function handleCopyLink() {
    await navigator.clipboard.writeText(link);
  }

  if (isForbiddenError(errorOnRoomQuery)) return <Navigate to="/" replace />;
  if (!getSocket()) return <Navigate to="/" replace />;

  return (
    <div className="App">
      {isLoadingRoom ? (
        <span>Loading...</span>
      ) : (
        <>
          <p>Room ID: {roomId}</p>
          <p>
            Share: {link}
            <button onClick={handleCopyLink}>Copy</button>
          </p>
          {isConnectionLost && <p>Connection lost, trying to reconnect...</p>}
          {errorOnConnect && <p>Error on connect: {errorOnConnect?.message}</p>}
          <Video ref={videoRef} autoPlay />
          {others?.map((user) => (
            <span key={user.id}>{user.id}</span>
          ))}
        </>
      )}
    </div>
  );
}
