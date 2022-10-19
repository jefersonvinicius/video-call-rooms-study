import { User } from 'modules/users';

export function createUserFromAPI(userAPI: any): User {
  return { id: userAPI.id, name: userAPI.name, createdAt: new Date(userAPI.created_at), streamId: userAPI.streamId };
}
