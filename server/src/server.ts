import express from 'express';
import cors from 'cors';
import { RoomsRepository } from './repositories/rooms';
import { UsersRepository } from './repositories/users';
import { Server, Socket } from 'socket.io';
import http from 'http';
import fs from 'node:fs';
import { CONFIG } from './config';

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

const sockets = new Map<string, UserSocket>();
const streams = new Map<string, fs.WriteStream>();

io.on('connection', (socket) => {
  sockets.set(socket.id, new UserSocket('', socket));
  streams.set(socket.id, fs.createWriteStream(`${CONFIG.VIDEOS_OUTPUT_PATH}/${socket.id}.webm`));

  socket.on('stream-video', (data) => {
    console.log({ data });
    streams.get(socket.id)?.write(data);
  });

  socket.on('disconnect', () => {
    console.log('Disconnect');
    sockets.delete(socket.id);
  });
});

app.post('/users', (request, response) => {
  const user = usersRepository.create();
  return response.json(user.render());
});

app.post('/rooms', (request, response) => {
  const room = roomsRepository.create();
  return response.json(room.render());
});

function clearApp() {
  Array.from(sockets.values()).forEach((socket) => socket.socket.disconnect(true));
  Array.from(streams.values()).forEach((stream) => stream.close());
  io.close(() => {
    console.log('Socket server closed');
  });
  server.close(() => {
    console.log('HTTP Server closed');
  });
}

process.on('SIGINT', clearApp);
process.on('uncaughtException', clearApp);
process.on('unhandledRejection', clearApp);

export default server;
