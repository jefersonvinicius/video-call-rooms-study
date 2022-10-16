import { log } from '@app/shared/logging';
import { UUID } from '@app/shared/uuid';

export class User {
  private _id: string;
  public createdAt: Date;
  private _sdp: string | undefined | null;

  constructor(readonly name: string) {
    this._id = UUID.v4();
    this.createdAt = new Date();
  }

  get id() {
    return this._id;
  }

  set sdp(value: string | null | undefined) {
    log(`Setting sdp to user ${this.name}`);
    this._sdp = value;
  }

  get sdp() {
    return this._sdp;
  }

  json() {
    return { id: this._id, name: this.name, created_at: this.createdAt.toISOString(), sdp: this.sdp };
  }
}
