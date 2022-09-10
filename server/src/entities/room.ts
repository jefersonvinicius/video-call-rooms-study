import { UUID } from '@app/shared/uuid';
import { User } from './user';

export class Room {
  private _users: User[] = [];
  private _id: string;
  readonly createdAt: Date;

  constructor() {
    this._id = UUID.v4();
    this.createdAt = new Date();
  }

  addUser(user: User) {
    this.users.push(user);
  }

  removeUser(userId: string) {
    this._users = this.users.filter((user) => user.id !== userId);
  }

  render() {
    return { id: this._id, created_at: this.createdAt.toISOString() };
  }

  get users() {
    return this._users.slice();
  }
}
