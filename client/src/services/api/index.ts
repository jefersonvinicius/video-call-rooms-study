import axios from 'axios';
import { RoomsService } from 'modules/rooms/services/api';
import { UsersService } from 'modules/users/services/api';

export const api = axios.create({
  baseURL: 'http://localhost:3333',
});

const userServices = new UsersService(api);
const roomsServices = new RoomsService(api);

export class API {
  static get Users() {
    return userServices;
  }

  static get Rooms() {
    return roomsServices;
  }
}
