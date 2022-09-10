import fs from 'node:fs';
import { Duplex } from 'node:stream';
import { Socket } from 'socket.io';
import { CONFIG } from './config';

export class VideoStream {
  private fsStream: fs.WriteStream;
  private videoStream: Duplex;

  constructor(readonly socket: Socket) {
    this.fsStream = fs.createWriteStream(`${CONFIG.VIDEOS_OUTPUT_PATH}/${Date.now()}-${socket.id}.webm`);
    this.videoStream = new Duplex({
      write(chunk, _, callback) {
        this.push(chunk);
        callback();
      },
      read() {},
    });
    this.videoStream.pipe(this.fsStream);
  }

  destroy() {
    this.fsStream.close();
  }

  write(chunk: Buffer) {
    this.videoStream.write(chunk);
  }

  get stream() {
    return this.videoStream;
  }
}
