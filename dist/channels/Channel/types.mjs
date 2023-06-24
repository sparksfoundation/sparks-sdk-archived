import { Channel } from "./Channel.mjs";
export var SparksChannel;
((SparksChannel2) => {
  let Receipt;
  ((Receipt2) => {
    let Types;
    ((Types2) => {
      Types2["OPEN_ACCEPTED"] = "OPEN_ACCEPTED";
      Types2["OPEN_CONFIRMED"] = "OPEN_CONFIRMED";
      Types2["MESSAGE_CONFIRMED"] = "MESSAGE_CONFIRMED";
      Types2["CLOSE_CONFIRMED"] = "CLOSE_CONFIRMED";
    })(Types = Receipt2.Types || (Receipt2.Types = {}));
  })(Receipt = SparksChannel2.Receipt || (SparksChannel2.Receipt = {}));
  let Event;
  ((Event2) => {
    let Types;
    ((Types2) => {
      Types2["OPEN_REQUEST"] = "OPEN_REQUEST";
      Types2["OPEN_ACCEPT"] = "OPEN_ACCEPT";
      Types2["OPEN_CONFIRM"] = "OPEN_CONFIRM";
      Types2["MESSAGE"] = "MESSAGE";
      Types2["MESSAGE_CONFIRM"] = "MESSAGE_CONFIRM";
      Types2["CLOSE"] = "CLOSE";
      Types2["CLOSE_CONFIRM"] = "CLOSE_CONFIRM";
    })(Types = Event2.Types || (Event2.Types = {}));
  })(Event = SparksChannel2.Event || (SparksChannel2.Event = {}));
  let Error;
  ((Error2) => {
    let Types;
    ((Types2) => {
      Types2["SEND_REQUEST_ERROR"] = "SEND_REQUEST_ERROR";
      Types2["EVENT_PROMISE_ERROR"] = "EVENT_PROMISE_ERROR";
      Types2["SHARED_KEY_CREATION_ERROR"] = "SHARED_KEY_CREATION_ERROR";
      Types2["OPEN_REQUEST_REJECTED"] = "OPEN_REQUEST_REJECTED";
      Types2["COMPUTE_SHARED_KEY_ERROR"] = "COMPUTE_SHARED_KEY_ERROR";
      Types2["UNEXPECTED_ERROR"] = "UNEXPECTED_ERROR";
      Types2["INVALID_PUBLIC_KEYS"] = "INVALID_PUBLIC_KEYS";
      Types2["INVALID_IDENTIFIER"] = "INVALID_IDENTIFIER";
      Types2["OPEN_CIPHERTEXT_ERROR"] = "OPEN_CIPHERTEXT_ERROR";
      Types2["CREATE_CIPHERTEXT_ERROR"] = "CREATE_CIPHERTEXT_ERROR";
    })(Types = Error2.Types || (Error2.Types = {}));
  })(Error = SparksChannel2.Error || (SparksChannel2.Error = {}));
})(SparksChannel || (SparksChannel = {}));
export class AChannel {
  constructor({ spark, channel }) {
    this.spark = spark;
    this.channel = channel || new Channel({ spark });
    Object.defineProperties(this, {
      spark: { enumerable: false },
      channel: { enumerable: false }
    });
    this.channel.setMessageHandler((message) => {
      if (this.onmessage)
        this.onmessage(message);
    });
  }
  get cid() {
    return this.channel.cid;
  }
  get peer() {
    return this.channel.peer;
  }
  get eventLog() {
    return this.channel.eventLog;
  }
  get opened() {
    return this.channel.opened;
  }
  open() {
    return this.channel.open();
  }
  close() {
    return this.channel.close();
  }
  send(message) {
    return this.channel.send(message);
  }
  acceptOpen(request) {
    return this.channel.acceptOpen(request);
  }
  rejectOpen(request) {
    return this.channel.rejectOpen(request);
  }
}
