import cors from 'cors';
import express from 'express';
import http from 'http';
import fs from 'node:fs';
import { Server, Socket } from 'socket.io';
import { CONFIG } from './config';
import { Room } from './entities/room';
import { User } from './entities/user';
import { VideoStream } from './video-stream';

function log(message: string) {
  console.log(`[LOG ${new Date().toISOString()}]: ${message}`);
}

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

class UserSocket {
  constructor(readonly user: User, readonly socket: Socket) {}
}

const rooms = new Map<string, Room>();
const sockets = new Map<string, UserSocket>();
const streams = new Map<string, VideoStream>();
const usersCache = new Map<string, User>();

io.on('connection', (socket) => {
  log(`Socket ${socket.id} connected`);
  streams.set(socket.id, new VideoStream(socket));

  socket.on('set-user-info', (params: { userId: string }) => {
    log(`Setting user id ${params.userId} to socket ${socket.id}`);
    const userSocket = new UserSocket(usersCache.get(params.userId)!, socket);
    sockets.set(socket.id, userSocket);
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
    log(`Joining in the room ${roomId}`);

    await socket.join(roomId);
    const userSocket = sockets.get(socket.id);
    rooms.get(roomId)?.addUser(userSocket!.user);
    io.to(roomId).emit('joined-user', userSocket?.user);
    callback?.();
  });

  socket.on('disconnect', () => {
    log(`Socket ${socket.id} disconnected`);
    streams.get(socket.id)?.destroy();
    sockets.delete(socket.id);
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
  const user = new User();
  usersCache.set(user.id, user);
  return response.json(user.render());
});

app.post('/rooms', (request, response) => {
  const userId = String(request.header('userId'));
  const user = usersCache.get(userId)!;
  log(`Creating room to user ${user.id}`);
  const room = new Room();
  room.addUser(user);
  rooms.set(room.id, room);
  return response.json(room.render());
});

app.get('/rooms/:roomId', (request, response) => {
  const room = rooms.get(request.params.roomId);
  if (!room) return response.status(404).json({ message: 'Room not found' });

  return response.json({ room: room.render() });
});

function handleAppError() {
  Array.from(sockets.values()).forEach((socket) => socket.socket.disconnect(true));
  Array.from(streams.values()).forEach((stream) => stream.destroy());
  io.close(() => console.log('Socket server closed'));
  server.close(() => console.log('HTTP Server closed'));
}

process.on('SIGINT', handleAppError);
process.on('uncaughtException', handleAppError);
process.on('unhandledRejection', handleAppError);

export default server;
