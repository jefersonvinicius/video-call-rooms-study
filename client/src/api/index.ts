import axios from 'axios';
import { Room } from 'entities/room';
import { User } from 'entities/user';

const api = axios.create({
  baseURL: 'http://localhost:3333',
});

class Users {
  static async create() {
    const { data } = await api.post('/users');
    return { id: data.id, createdAt: new Date(data.created_at) } as User;
  }
}

class Rooms {
  static async create() {
    const { data } = await api.post('/rooms');
    return { id: data.id, createdAt: new Date(data.created_at) } as Room;
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
