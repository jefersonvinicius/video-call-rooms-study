import { UserSocket } from './user-socket';

export class UserSocketCollection {
  private socketIdToUserSocket = new Map<string, UserSocket>();
  private userIdToUserSocket = new Map<string, UserSocket>();

  add(userSocket: UserSocket) {
    this.socketIdToUserSocket.set(userSocket.socket.id, userSocket);
    this.userIdToUserSocket.set(userSocket.user.id, userSocket);
  }

  getBySocketId(socketId: string) {
    return this.socketIdToUserSocket.get(socketId);
  }

  getByUserId(userId: string) {
    return this.userIdToUserSocket.get(userId);
  }

  delete(socketId: string) {
    const user = this.getBySocketId(socketId)?.user;
    if (user) this.userIdToUserSocket.delete(user.id);
    this.socketIdToUserSocket.delete(socketId);
  }

  all() {
    return Array.from(this.socketIdToUserSocket.values());
  }
}
