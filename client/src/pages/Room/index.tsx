import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { io } from 'socket.io-client';
export const Video = styled.video`
  width: 100px;
  height: 100px;
`;

export default function RoomPage() {
  const { roomId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let mediaRecorder: MediaRecorder | null = null;
    const socket = io('wss://localhost:3333');
    socket.on('connect', () => {
      console.log('socket connected');
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.addEventListener('dataavailable', handleDataAvailable);
          mediaRecorder.start(1000);
        }
      });
    });

    function handleDataAvailable(event: BlobEvent) {
      console.log(event.data);
      socket.emit('stream-video', event.data);
    }

    return () => {
      mediaRecorder?.removeEventListener('dataavailable', handleDataAvailable);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <p>Room ID: {roomId}</p>
      <Video ref={videoRef} autoPlay />
    </div>
  );
}
