import { ErrorMessage } from "../common/errors";
import { SparkError } from "../common/errors";
import { ChannelType } from "./types";
import { ChannelErrorType } from "./types/errors";

export class ChannelErrorFactory {
  private channel: ChannelType;
  constructor(channel) {
    this.channel = channel;
  }

  public setChannel(channel) {
    this.channel = channel;
  }

  public RecieptOpenFailure(reason?: ErrorMessage) {
    return new SparkError({
      type: ChannelErrorType.RECEIPT_OPEN_FAILURE,
      message: `failed to open receipt${reason ? `: ${reason}` : ''}`,
      metadata: { channel: this.channel }
    });
  }

  public InvalidPeerInfo(reason?: ErrorMessage) {
    return new SparkError({
      type: ChannelErrorType.INVALID_PEER_INFO,
      message: `invalid peer info${reason ? `: ${reason}` : ''}`,
      metadata: { channel: this.channel }
    });
  }

  public InvalidReceiptEventType(reason?: ErrorMessage) {
    return new SparkError({
      type: ChannelErrorType.INVALID_RECEIPT_EVENT_TYPE,
      message: `invalid receipt event type${reason ? `: ${reason}` : ''}`,
      metadata: { channel: this.channel }
    });
  }
}