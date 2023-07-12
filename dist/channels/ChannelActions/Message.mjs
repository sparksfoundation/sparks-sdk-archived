import { ChannelConfirmEvent, ChannelRequestEvent } from "../ChannelEvent/index.mjs";
import merge from "lodash.merge";
import { ChannelAction } from "./ChannelAction.mjs";
import cuid from "cuid";
const Actions = ["MESSAGE"];
const Events = {
  MESSAGE_REQUEST: "MESSAGE_REQUEST",
  MESSAGE_CONFIRM: "MESSAGE_CONFIRM",
  MESSAGE_ERROR: "MESSAGE_ERROR"
};
export class Message extends ChannelAction {
  constructor() {
    super(...arguments);
    this.name = "MESSAGE";
    this.actions = Actions;
    this.MESSAGE_REQUEST = async (params) => {
      const type = Events.MESSAGE_REQUEST;
      const data = params?.data || "";
      const metadata = { ...params?.metadata, messageId: cuid(), channelId: this.channel.channelId };
      const request = new ChannelRequestEvent({ type, metadata, data });
      const sealed = await request.seal({
        sharedKey: this.channel.peer.sharedKey,
        cipher: this.spark.cipher,
        signer: this.spark.signer
      });
      const confirmEvent = await this.channel.dispatchRequest(sealed);
      return confirmEvent;
    };
    this.MESSAGE_CONFIRM = async (requestEvent) => {
      return Promise.resolve(new ChannelConfirmEvent({
        type: Events.MESSAGE_CONFIRM,
        metadata: merge({}, requestEvent?.metadata),
        data: "confirmed"
      }));
    };
  }
  setContext({ spark, channel }) {
    this.spark = spark;
    this.channel = channel;
  }
}
