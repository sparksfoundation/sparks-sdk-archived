import { Channel } from "./Channel.mjs";
export var SparksChannel;
((SparksChannel2) => {
  let EventTypes;
  ((EventTypes2) => {
    EventTypes2["OPEN_REQUEST"] = "OPEN_REQUEST";
    EventTypes2["OPEN_ACCEPT"] = "OPEN_ACCEPT";
    EventTypes2["OPEN_CONFIRM"] = "OPEN_CONFIRM";
  })(EventTypes = SparksChannel2.EventTypes || (SparksChannel2.EventTypes = {}));
  let ErrorTypes;
  ((ErrorTypes2) => {
    ErrorTypes2["OPEN_REQUEST_FAILED"] = "OPEN_REQUEST_FAILED";
    ErrorTypes2["OPEN_REQUEST_REJECTED"] = "OPEN_REQUEST_REJECTED";
    ErrorTypes2["OPEN_CONFIRM_FAILED"] = "OPEN_CONFIRM_FAILED";
    ErrorTypes2["RECEIPT_CREATION_FAILED"] = "RECEIPT_CREATION_FAILED";
    ErrorTypes2["RECEIPT_VERIFICATION_FAILED"] = "RECEIPT_VERIFICATION_FAILED";
    ErrorTypes2["OPEN_ACCEPT_FAILED"] = "OPEN_ACCEPT_FAILED";
    ErrorTypes2["OPEN_ACCEPT_REJECTED"] = "OPEN_ACCEPT_REJECTED";
    ErrorTypes2["CHANNEL_ERROR"] = "CHANNEL_ERROR";
  })(ErrorTypes = SparksChannel2.ErrorTypes || (SparksChannel2.ErrorTypes = {}));
  let ReceiptTypes;
  ((ReceiptTypes2) => {
    ReceiptTypes2["OPEN_CONFIRMED"] = "OPEN_CONFIRMED";
  })(ReceiptTypes = SparksChannel2.ReceiptTypes || (SparksChannel2.ReceiptTypes = {}));
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
