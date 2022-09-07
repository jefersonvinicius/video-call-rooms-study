import { User } from '@app/entities/user';

export class UsersRepository {
  private users: User[] = [];

  create() {
    const user = new User();
    this.users.push(user);
    return user;
  }
}
