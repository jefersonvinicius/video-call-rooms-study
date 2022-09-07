import { Room } from '@app/entities/room';

export class RoomsRepository {
  private rooms: Room[] = [];

  create() {
    const room = new Room();
    this.rooms.push(room);
    return room;
  }
}
