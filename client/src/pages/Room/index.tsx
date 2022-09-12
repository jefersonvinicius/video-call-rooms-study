import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { io } from 'socket.io-client';
import { useUser } from 'modules/users/state';
export const Video = styled.video`
  width: 100px;
  height: 100px;
`;

export default function RoomPage() {
  const { roomId } = useParams();
  const user = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isConnectionLost, setIsConnectionLost] = useState(false);
  const [errorOnConnect, setErrorOnConnect] = useState<any | null>(null);

  useEffect(() => {
    let mediaRecorder: MediaRecorder | null = null;
    const socket = user?.socket ?? io('http://localhost:3333');
    socket.on('connect', () => {
      setErrorOnConnect(null);
      setIsConnectionLost(false);
      console.log('socket connected');
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.addEventListener('dataavailable', handleDataAvailable);
          mediaRecorder.addEventListener('stop', handleStopRecorder);
          mediaRecorder.start(1000);
        }
      });
    });

    socket.on('disconnect', (reason: string) => {
      console.log('disconnect because of ' + reason);
      if (['io server disconnect', 'transport close'].includes(reason)) {
        setIsConnectionLost(true);
      }
    });

    socket.on('connect_error', (error) => {
      console.log('connect error with ' + error);
      setErrorOnConnect(error);
    });

    function handleDataAvailable(event: BlobEvent) {
      console.log('sending data: ', event.data);
      socket.emit('stream-video', event.data);
    }

    function handleStopRecorder() {
      console.log('Stopping on server');
      socket.emit('stop-stream-video');
    }

    return () => {
      mediaRecorder?.stream.getTracks().forEach((track) => track.stop());
      mediaRecorder?.stop();
      socket.disconnect();
    };
  }, [user?.socket]);

  const link = `${window.location.origin}/waiting-room/${roomId}`;

  async function handleCopyLink() {
    await navigator.clipboard.writeText(link);
  }

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
