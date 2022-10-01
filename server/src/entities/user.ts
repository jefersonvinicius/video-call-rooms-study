import { UUID } from '@app/shared/uuid';

export class User {
  private _id: string;
  public createdAt: Date;
  public sdp: string | undefined | null;

  constructor(readonly name: string) {
    this._id = UUID.v4();
    this.createdAt = new Date();
  }

  get id() {
    return this._id;
  }

  json() {
    return { id: this._id, name: this.name, created_at: this.createdAt.toISOString(), sdp: this.sdp };
  }
}
