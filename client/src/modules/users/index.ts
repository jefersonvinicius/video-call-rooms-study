import { Socket } from 'socket.io-client';

export type User = {
  id: string;
  createdAt: Date;
  socket?: Socket;
};
