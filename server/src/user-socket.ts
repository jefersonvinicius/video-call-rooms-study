import { Socket } from 'socket.io';
import { User } from './entities/user';

export class UserSocket {
  constructor(readonly user: User, readonly socket: Socket) {}
}
