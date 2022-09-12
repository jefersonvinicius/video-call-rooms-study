import { User } from '../users';

export type Room = {
  id: string;
  createdAt: Date;
  users: User[];
};
