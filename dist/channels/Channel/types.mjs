import { Channel } from "./Channel.mjs";
export var SparksChannel;
((SparksChannel2) => {
  let Receipt;
  ((Receipt2) => {
    let Types;
    ((Types2) => {
      Types2["OPEN_ACCEPTED"] = "OPEN_ACCEPTED";
      Types2["OPEN_CONFIRMED"] = "OPEN_CONFIRMED";
      Types2["MESSAGE_RECEIVED"] = "MESSAGE_RECEIVED";
    })(Types = Receipt2.Types || (Receipt2.Types = {}));
  })(Receipt = SparksChannel2.Receipt || (SparksChannel2.Receipt = {}));
  let Event;
  ((Event2) => {
    let Types;
    ((Types2) => {
      Types2["OPEN_REQUEST"] = "OPEN_REQUEST";
      Types2["OPEN_ACCEPT"] = "OPEN_ACCEPT";
      Types2["OPEN_CONFIRM"] = "OPEN_CONFIRM";
      Types2["MESSAGE_REQUEST"] = "MESSAGE_REQUEST";
      Types2["MESSAGE_CONFIRM"] = "MESSAGE_CONFIRM";
    })(Types = Event2.Types || (Event2.Types = {}));
  })(Event = SparksChannel2.Event || (SparksChannel2.Event = {}));
  let Error;
  ((Error2) => {
    let Types;
    ((Types2) => {
      Types2["SEND_REQUEST_ERROR"] = "SEND_REQUEST_ERROR";
      Types2["EVENT_PROMISE_ERROR"] = "EVENT_PROMISE_ERROR";
      Types2["RECEIPT_CREATION_ERROR"] = "RECEIPT_CREATION_ERROR";
      Types2["RECEIPT_VERIFICATION_ERROR"] = "RECEIPT_VERIFICATION_ERROR";
      Types2["SHARED_KEY_CREATION_ERROR"] = "SHARED_KEY_CREATION_ERROR";
      Types2["OPEN_REQUEST_REJECTED"] = "OPEN_REQUEST_REJECTED";
      Types2["UNEXPECTED_ERROR"] = "UNEXPECTED_ERROR";
    })(Types = Error2.Types || (Error2.Types = {}));
  })(Error = SparksChannel2.Error || (SparksChannel2.Error = {}));
})(SparksChannel || (SparksChannel = {}));
export class AChannel {
  constructor(spark) {
    this.spark = spark;
    this.channel = new Channel(spark);
  }
  get cid() {
    return this.channel.cid;
  }
  get peer() {
    return this.channel.peer;
  }
}
