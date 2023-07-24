import { ChannelExport, ChannelType, SparkChannelParams } from "../SparkChannel/types";

export type PostMessageParams = SparkChannelParams & {
  _window?: Window;
  source?: Window;
}

export type PostMessageExport = ChannelExport & {
  type: ChannelType,
  peer: ChannelExport['peer'] & {
    origin: string;
  }
}
export type ChannelId = string;

