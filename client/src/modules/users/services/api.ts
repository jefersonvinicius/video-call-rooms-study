import { AxiosInstance } from 'axios';
import { createUserFromAPI } from 'services/api/parsers';
import { User } from '..';

export class UsersAPI {
  constructor(readonly api: AxiosInstance) {}

  async create(username: string): Promise<User> {
    const { data } = await this.api.post('/users', { name: username });
    return createUserFromAPI(data);
  }
}
