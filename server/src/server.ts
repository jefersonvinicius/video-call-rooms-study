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
  constructor(readonly userId: string, readonly socket: Socket) {}
}

const rooms = new Map<string, Room>();
const sockets = new Map<string, UserSocket>();
const streams = new Map<string, VideoStream>();

io.on('connection', (socket) => {
  log(`Socket ${socket.id} connected`);
  sockets.set(socket.id, new UserSocket('', socket));
  streams.set(socket.id, new VideoStream(socket));

  socket.on('stream-video', (data) => {
    log(`Receiving data from socket ${socket.id}`);
    streams.get(socket.id)?.write(data);
  });

  socket.on('stop-stream-video', () => {
    log(`Stopping stream to socket ${socket.id}`);
    streams.get(socket.id)?.destroy();
  });

  socket.on('join-room', ({ roomId }: { roomId: string }) => {
    console.log(`Joining in the room ${roomId}`);
    const room = socket.join(roomId);
  });

  socket.on('disconnect', () => {
    log(`Socket ${socket.id} disconnected`);
    streams.get(socket.id)?.destroy();
    sockets.delete(socket.id);
  });
});

app.post('/users', (request, response) => {
  const user = new User();
  return response.json(user.render());
});

app.get('/users/streams/:socketId', (request, response) => {
  const videoStream = streams.get(request.params.socketId);
  if (!videoStream) return response.sendStatus(404);

  response.header('content-type', 'video/webm');
  return videoStream.stream.pipe(response);
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

app.post('/rooms', (request, response) => {
  const room = new Room();
  return response.json(room.render());
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
