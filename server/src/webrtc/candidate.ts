export type CandidatePlainObject = {
  candidate: string;
  sdpMid: string;
  sdpMLineIndex: number;
};

export class Candidate {
  constructor(readonly info: string, readonly sdpMid: string, readonly sdpMLineIndex: number) {}

  static fromPlainObject(object: CandidatePlainObject) {
    return new Candidate(object.candidate, object.sdpMid, object.sdpMLineIndex);
  }
}
