import { AxiosInstance } from 'axios';
import { Room } from '..';

export class RoomsService {
  constructor(readonly api: AxiosInstance) {}

  async create(): Promise<Room> {
    const { data } = await this.api.post('/rooms');
    return { id: data.id, createdAt: new Date(data.created_at), users: [] };
  }

  async fetchOne(params: { id: string }): Promise<Room> {
    const { data } = await this.api.get(`/rooms/${params.id}`);
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
