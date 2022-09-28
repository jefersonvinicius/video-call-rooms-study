import axios from 'axios';
import { RoomsAPI } from 'modules/rooms/services/api';
import { UsersAPI } from 'modules/users/services/api';

export const api = axios.create({
  baseURL: 'https://0.0.0.0:3333',
});

const userServices = new UsersAPI(api);
const roomsServices = new RoomsAPI(api);

export class API {
  static get Users() {
    return userServices;
  }

  static get Rooms() {
    return roomsServices;
  }
}
