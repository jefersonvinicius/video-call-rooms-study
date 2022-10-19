import cors from 'cors';
import express, { response } from 'express';
import http from 'node:http';
import fs from 'node:fs';
import { Server, Socket } from 'socket.io';
import { CONFIG } from './config';
import { Room } from './entities/room';
import { User } from './entities/user';
import { formatObject } from './shared/json';
import { log } from './shared/logging';
import { UserSocket } from './user-socket';
import { UserSocketCollection } from './user-socket-collection';
import { VideoStream } from './video-stream';
import { CandidatePlainObject } from './webrtc/candidate';

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

type Offer = {
  sdp: string;
  type: string;
};

type Answer = Offer;

const rooms = new Map<string, Room>();
const socketsCollection = new UserSocketCollection();
const streams = new Map<string, VideoStream>();
const usersCache = new Map<string, User>();

io.on('connection', (socket) => {
  log(`Socket ${socket.id} connected`);
  const videoStream = new VideoStream(socket);
  streams.set(socket.id, videoStream);

  // videoStream.stream.on('data', (chunk) => {
  //   log(`Sending data from socket ${socket.id}`);
  //   socket.rooms.forEach((room) => {
  //     const userId = socketsCollection.getBySocketId(socket.id)?.user.id;
  //     if (!userId) return;

  //     socket.to(room).emit('stream-video', { userId, buffer: chunk });
  //   });
  // });

  socket.on('set-user-info', (params: { userId: string }, callback?: () => void) => {
    const user = usersCache.get(params.userId);
    if (!user) return;

    log(`Setting user id ${params.userId} to socket ${socket.id}`);
    const userSocket = new UserSocket(user, socket);
    socketsCollection.add(userSocket);
    callback?.();
  });

  socket.on('set-stream-id', ({ streamId }) => {
    const user = socketsCollection.getBySocketId(socket.id)?.user;
    log(`Setting stream id ${streamId} to ${user?.name}`);
    if (user) user.streamId = streamId;
  });

  socket.on('stream-video', (data) => {
    log(`Receiving data from socket ${socket.id}`);
    streams.get(socket.id)?.write(data);
  });

  socket.on('stop-stream-video', () => {
    log(`Stopping stream to socket ${socket.id}`);
    streams.get(socket.id)?.destroy();
  });

  socket.on('join-room', async ({ roomId }: { roomId: string }, callback?: () => void) => {
    const userSocket = socketsCollection.getBySocketId(socket.id);
    const user = userSocket!.user;
    log(`Joining ${user.id} in the room ${roomId}`);

    rooms.get(roomId)?.addUser(user);
    await socket.join(roomId);
    console.log(io.sockets.adapter.rooms);
    io.to(roomId).emit('joined-user', { user });
    callback?.();
  });

  socket.on('offer-candidate', (params: { roomId: string; candidate: CandidatePlainObject }) => {
    log(`Offer candidate ${formatObject(params)}`);
    io.to(params.roomId).emit('offer-candidate', { candidate: params.candidate });
  });

  socket.on('answer-candidate', (params: { roomId: string; candidate: CandidatePlainObject }) => {
    log(`Answer candidate ${formatObject(params)}`);
    io.to(params.roomId).emit('answer-candidate', { candidate: params.candidate });
  });

  socket.on('offer', (params: { roomId: string; offer: Offer }) => {
    log(`Offer created ${formatObject(params)}`);
    const user = socketsCollection.getBySocketId(socket.id)?.user;

    user!.sdp = params.offer.sdp;
    const roomId = params.roomId;
    const offerData = { ...params, user: user?.json() };
    io.to(roomId).emit('offer', offerData);
  });

  socket.on('answer', async (params: { roomId: string; answer: Answer; user: any }) => {
    log(`Answer created ${formatObject(params)}`);

    const socketUserReceivedOffer = socketsCollection.getBySocketId(socket.id);
    if (socketUserReceivedOffer) socketUserReceivedOffer.user.sdp = params.answer.sdp;

    const socketUserAnswered = socketsCollection.getByUserId(params.user.id);
    rooms.get(params.roomId)?.addUser(socketUserAnswered?.user!);
    await socketUserAnswered?.socket.join(params.roomId);

    io.to(params.roomId).emit('answer', params);
  });

  socket.on('disconnect', () => {
    log(`Socket ${socket.id} disconnected`);
    streams.get(socket.id)?.destroy();
    socketsCollection.delete(socket.id);
  });
});

app.get('/users/videos/:videoName', (request, response) => {
  const videoPath = `${CONFIG.VIDEOS_OUTPUT_PATH}/${request.params.videoName}.webm`;
  if (!fs.existsSync(videoPath)) return response.sendStatus(404);

  const videoStream = fs.createReadStream(videoPath, {
    autoClose: true,
  });
  response.header('content-type', 'video/webm');
  return videoStream.pipe(response);
});

app.post('/users', (request, response) => {
  const name = request.body?.name?.trim() ?? '';
  if (!name) return response.status(400).json({ message: 'Missing user name' });

  const user = new User(name);
  usersCache.set(user.id, user);
  return response.json(user.json());
});

app.post('/rooms', async (request, response) => {
  const userId = String(request.header('userId'));
  const user = usersCache.get(userId)!;
  log(`Creating room to user ${user.id}`);
  const room = new Room();
  room.addUser(user);
  rooms.set(room.id, room);
  await socketsCollection.getByUserId(userId)?.socket.join(room.id);
  return response.json(room.json());
});

app.get('/waiting-room/:roomId', (request, response) => {
  const room = rooms.get(request.params.roomId);
  if (!room) return response.status(404).json({ message: 'Room not found' });

  return response.json({ room: room.json() });
});

app.get('/rooms/:roomId', (request, response) => {
  const room = rooms.get(request.params.roomId);
  if (!room) return response.status(404).json({ message: 'Room not found' });

  const userId = request.header('userId');
  const user = room.users.find((u) => u.id === userId);
  if (!user) return response.status(403).json({ message: 'You not in this room' });

  return response.json({ room: room.json() });
});

app.get('/debug', (_, response) => {
  return response.json({
    'Quantidade de Salas': rooms.size,
  });
});

// app.get('/videos/:userId', (request, response) => {
//   const { userId } = request.params;
//   const socket = socketsCollection.getByUserId(userId)?.socket;
//   const videoStream = streams.get(socket?.id!);
//   if (!videoStream) return response.sendStatus(404);

//   response.writeHead(206, {
//     'Content-Range': `bytes ${videoStream.stream.writableLength}-${videoStream.stream.writableLength}/${videoStream.stream.writableLength}`,
//     'Accept-Ranges': 'bytes',
//     'Content-Length': videoStream.stream.writableLength,
//     'Content-Type': 'video/webm',
//   });
//   videoStream.stream.pipe(response);
// });

// function handleAppError() {
//   socketsCollection.all().forEach((socket) => socket.socket.disconnect(true));
//   Array.from(streams.values()).forEach((stream) => stream.destroy());
//   io.close(() => console.log('Socket server closed'));
//   server.close(() => console.log('HTTP Server closed'));
// }

// process.on('SIGINT', handleAppError);
// process.on('uncaughtException', handleAppError);
// process.on('unhandledRejection', handleAppError);

export default server;
