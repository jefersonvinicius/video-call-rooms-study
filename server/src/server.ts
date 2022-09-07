import express from 'express';
import cors from 'cors';
import { RoomsRepository } from './repositories/rooms';
import { UsersRepository } from './repositories/users';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server);

class UserSocket {
  constructor(readonly userId: string, readonly socketId: string) {}
}

const roomsRepository = new RoomsRepository();
const usersRepository = new UsersRepository();
const sockets = new Map<string, UserSocket>();

io.on('connection', (socket) => {
  console.log({ socket });
  sockets.set(socket.id, new UserSocket('', socket.id));

  socket.on('stream-video', (data) => {
    console.log({ data });
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

export default server;
