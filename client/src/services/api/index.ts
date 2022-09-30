import axios from 'axios';
import { RoomsAPI } from 'modules/rooms/services/api';
import { UsersAPI } from 'modules/users/services/api';

export const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_API_URL!,
  headers: { 'ngrok-skip-browser-warning': 'yes' },
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
