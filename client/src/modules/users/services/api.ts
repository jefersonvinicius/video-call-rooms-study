import { AxiosInstance } from 'axios';
import { User } from '..';

export class UsersService {
  constructor(readonly api: AxiosInstance) {}

  async create(): Promise<User> {
    const { data } = await this.api.post('/users');
    return { id: data.id, createdAt: new Date(data.created_at) };
  }
}
