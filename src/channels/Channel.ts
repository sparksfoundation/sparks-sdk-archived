import { randomNonce } from "../utilities/index.js";

export class Channel {
  protected spark: any; // todo type
  public sharedKey: string;
  public cid: string;
  public target: {
    publicKey: string;
    source: Window;
    origin: string;
  };

  constructor({ spark, cid, sharedKey, publicKey, origin, source }) {
    this.cid = cid;
    this.spark = spark;
    this.sharedKey = sharedKey;
    this.target = { source, origin, publicKey };
  }

  send(data) {
    throw new Error('not implemented');
  }
}

export class EncryptedMessage {
  public ciphertext: string;
  public timestamp: number;
  constructor({ sender, ciphertext, timestamp }) {
    if (!sender || !ciphertext || !timestamp) {
      throw new Error('invalid message');
    }
    this.ciphertext = ciphertext;
    this.timestamp = timestamp;
  }
}

export class DecryptedMessage {
  public cid: string;
  public mid: string;
  public sender: string;
  public content: any;
  public ciphertext: string;
  public timestamp: number;
  constructor({ cid, mid, ciphertext, sender, content, timestamp }) {
    if (!mid || !content || !timestamp) {
      throw new Error('invalid content');
    }
    this.cid = cid;
    this.mid = mid;
    this.sender = sender;
    this.content = content;
    this.ciphertext = ciphertext;
    this.timestamp = timestamp;
  }
}

export class ChannelFactory {
  protected spark: any; // todo type
  constructor(spark) {
    this.spark = spark;
  }
}