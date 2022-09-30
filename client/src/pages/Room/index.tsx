import IconButton from 'components/IconButton';
import { useUserMedia } from 'contexts/UserMedia';
import { useUserPeerConnection } from 'contexts/UserPeerConnection';
import { useUserSocket } from 'contexts/UserSocketContext';
import { useRoomQuery } from 'modules/rooms/hooks/queries';
import { User } from 'modules/users';
import { useUser } from 'modules/users/state';
import { useEffect, useRef } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { isForbiddenError } from 'services/api/errors';
import { MdOutlineContentCopy } from 'react-icons/md';
import { RoomContainer, RoomHeaderBox, Video, VideosGrid } from './styles';

type Offer = {
  type: RTCSdpType;
  sdp: string;
};

export default function RoomPage() {
  const { roomId } = useParams();
  const { room, errorOnRoomQuery, isLoadingRoom, refetchRoom } = useRoomQuery({ roomId });
  const currentUser = useUser();
  const { getSocket, errorOnConnect, isConnectionLost } = useUserSocket();
  const { peerConnection } = useUserPeerConnection();
  const { userMedia } = useUserMedia();

  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  useEffect(() => {
    const mediRecorderRef = mediaRecorder.current;
    return () => {
      mediRecorderRef?.stream.getTracks().forEach((track) => track.stop());
      mediRecorderRef?.stop();
    };
  }, []);

  const effectRan = useRef(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || errorOnRoomQuery || isLoadingRoom || !peerConnection || effectRan.current) return;

    effectRan.current = true;

    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }

    const remoteStream = new MediaStream();
    peerConnection.getReceivers().forEach((receiver) => {
      if (receiver.track) remoteStream.addTrack(receiver.track);
    });

    peerConnection.ontrack = (event) => {
      console.log('ON TRACK', event);
      console.log('RECEIVERS: ', peerConnection.getReceivers());
      peerConnection.getReceivers().forEach((receiver) => {
        if (receiver.track) remoteStream.addTrack(receiver.track);
      });
      // if (event.streams.length === 0) return;

      // event.streams[0].getTracks().forEach((track) => {
      //   remoteStream.addTrack(track);
      // });
    };

    peerConnection.onicecandidate = (event) => {
      console.log('room onicecandidate: ', event);

      if (!event.candidate) return;
      socket.emit('answer-candidate', { roomId, candidate: event.candidate?.toJSON() });
    };

    peerConnection.oniceconnectionstatechange = (event) => {
      console.log('oniceconnectionstatechange: ', peerConnection.connectionState);
    };

    socket.on('offer-candidate', async (params: { candidate?: RTCIceCandidateInit }) => {
      console.log('offer-candidate', params);
      await peerConnection.addIceCandidate(new RTCIceCandidate(params.candidate));
    });

    socket.on('offer', async (params: { roomId: string; offer: Offer; user: User }) => {
      console.log('Offer received', params);
      console.log('Setting remote description');
      await peerConnection.setRemoteDescription(new RTCSessionDescription(params.offer));
      const answerDescription = await peerConnection.createAnswer();
      console.log('Setting local description');
      await peerConnection.setLocalDescription(answerDescription);
      const answer = { type: answerDescription.type, sdp: answerDescription.sdp };

      console.log('Sending answer');
      socket.emit('answer', { roomId, answer, user: params.user });
    });

    getUserMediaOrReuse().then((stream) => {
      if (!videoRef.current || !remoteVideoRef.current) return;

      // setUserMedia(stream)

      console.log({
        currentLocalDescription: peerConnection.currentLocalDescription,
        currentRemoteDescription: peerConnection.currentRemoteDescription,
      });
      if (!peerConnection.currentLocalDescription) {
        console.log('Setting tracks');
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });
      }

      videoRef.current.srcObject = stream;
      remoteVideoRef.current.srcObject = remoteStream;

      //   mediaRecorder.current = new MediaRecorder(stream);
      //   mediaRecorder.current.addEventListener('dataavailable', handleDataAvailable);
      //   mediaRecorder.current.addEventListener('stop', handleStopRecorder);
      //   mediaRecorder.current.start(1000);
    });

    // socket.on('joined-user', handleJoinedUser);

    // function handleJoinedUser({ user }: { user: User }) {
    //   console.log({ user });
    //   console.log(`User ${user.id} joined in room`);
    //   refetchRoom();
    // }

    // function handleDataAvailable(event: BlobEvent) {
    //   console.log('sending data: ', event.data);
    //   socket?.emit('stream-video', event.data);
    // }

    // function handleStopRecorder() {
    //   console.log('Stopping on server');
    //   socket?.emit('stop-stream-video');
    // }

    async function getUserMediaOrReuse() {
      return userMedia ?? navigator.mediaDevices.getUserMedia({ video: true });
    }

    return () => {
      // socket.off('joined-user', handleJoinedUser);
    };
  }, [errorOnRoomQuery, getSocket, isLoadingRoom, room, currentUser, refetchRoom, peerConnection, roomId, userMedia]);

  const link = `http://localhost:3000/waiting-room/${roomId}`;

  async function handleCopyLink() {
    await navigator.clipboard.writeText(link);
    toast.info('Room link copied!');
  }

  if (isForbiddenError(errorOnRoomQuery)) return <Navigate to="/" replace />;
  if (!getSocket()) return <Navigate to="/" replace />;

  return (
    <RoomContainer>
      {isLoadingRoom ? (
        <span>Loading...</span>
      ) : (
        <>
          <RoomHeaderBox>
            <p>Room: {roomId}</p>
            <p>
              Share: <a href={link}>{link}</a>
              <IconButton onClick={handleCopyLink}>
                <MdOutlineContentCopy size={20} />
              </IconButton>
            </p>
          </RoomHeaderBox>
          {isConnectionLost && <p>Connection lost, trying to reconnect...</p>}
          {errorOnConnect && <p>Error on connect: {errorOnConnect?.message}</p>}
          <VideosGrid>
            <Video ref={videoRef} autoPlay />
            <Video ref={remoteVideoRef} autoPlay />
          </VideosGrid>
        </>
      )}
    </RoomContainer>
  );
}
