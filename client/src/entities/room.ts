import { User } from './user';

export type Room = {
  id: string;
  createdAt: Date;
  users: User[];
};
