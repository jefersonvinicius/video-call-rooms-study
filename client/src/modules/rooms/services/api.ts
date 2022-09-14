import { AxiosInstance } from 'axios';
import { Room } from '..';

export class RoomsAPI {
  constructor(readonly api: AxiosInstance) {}

  async create(): Promise<Room> {
    const { data } = await this.api.post('/rooms');
    return { id: data.id, createdAt: new Date(data.created_at), users: [] };
  }

  async fetchOne(params: { id: string }): Promise<Room> {
    const { data } = await this.api.get(`/rooms/${params.id}`);
    return mapToRoom(data);
  }

  async fetchWaitingRoom(params: { id: string }): Promise<Room> {
    const { data } = await this.api.get(`/waiting-room/${params.id}`);
    return mapToRoom(data);
  }
}

function mapToRoom(data: any): Room {
  return {
    id: data.room.id,
    createdAt: new Date(data.room.created_at),
    users: data.room.users.map((u: any) => ({
      id: u.id,
      createdAt: new Date(u.created_at),
    })),
  };
}
