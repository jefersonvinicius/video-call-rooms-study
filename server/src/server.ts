import express from 'express';
import cors from 'cors';
import { RoomsRepository } from './repositories/rooms';
import { UsersRepository } from './repositories/users';
import { Server, Socket } from 'socket.io';
import http from 'http';
import fs from 'node:fs';
import { CONFIG } from './config';
import { Duplex } from 'stream';

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

const roomsRepository = new RoomsRepository();
const usersRepository = new UsersRepository();

class VideoStream {
  private fsStream: fs.WriteStream;
  private videoStream: Duplex;

  constructor(readonly socket: Socket) {
    this.fsStream = fs.createWriteStream(`${CONFIG.VIDEOS_OUTPUT_PATH}/${Date.now()}-${socket.id}.webm`);
    this.videoStream = new Duplex({
      write(chunk, _, callback) {
        this.push(chunk);
        callback();
      },
      read() {},
    });
    this.videoStream.pipe(this.fsStream);
  }

  destroy() {
    this.fsStream.close();
  }

  write(chunk: Buffer) {
    this.videoStream.write(chunk);
  }

  get stream() {
    return this.videoStream;
  }
}

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

  socket.on('disconnect', () => {
    log(`Socket ${socket.id} disconnected`);
    streams.get(socket.id)?.destroy();
    sockets.delete(socket.id);
  });
});

app.post('/users', (request, response) => {
  const user = usersRepository.create();
  return response.json(user.render());
});

app.get('/users/streams/:socketId', (request, response) => {
  const videoStream = streams.get(request.params.socketId);
  if (!videoStream) return response.status(404).json({ message: 'Stream not found' });

  return videoStream.stream.pipe(response);
});

app.post('/rooms', (request, response) => {
  const room = roomsRepository.create();
  return response.json(room.render());
});

function clearApp() {
  Array.from(sockets.values()).forEach((socket) => socket.socket.disconnect(true));
  Array.from(streams.values()).forEach((stream) => stream.destroy());
  io.close(() => console.log('Socket server closed'));
  server.close(() => console.log('HTTP Server closed'));
}

process.on('SIGINT', clearApp);
process.on('uncaughtException', clearApp);
process.on('unhandledRejection', clearApp);

export default server;
