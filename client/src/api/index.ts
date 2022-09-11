import axios from 'axios';
import { Room } from 'entities/room';
import { User } from 'entities/user';

export const api = axios.create({
  baseURL: 'http://localhost:3333',
});

class Users {
  static async create() {
    const { data } = await api.post('/users');
    return { id: data.id, createdAt: new Date(data.created_at) } as User;
  }
}

class Rooms {
  static async create(): Promise<Room> {
    const { data } = await api.post('/rooms');
    return { id: data.id, createdAt: new Date(data.created_at), users: [] };
  }

  static async fetchOne(params: { id: string }): Promise<Room> {
    const { data } = await api.get(`/rooms/${params.id}`);
    return {
      id: data.room.id,
      createdAt: new Date(data.room.created_at),
      users: data.room.users.map((u: any) => ({
        id: u.id,
        createdAt: new Date(u.created_at),
      })),
    };
  }
}

export class API {
  static get Users() {
    return Users;
  }

  static get Rooms() {
    return Rooms;
  }
}
