import { ChannelExport, ChannelType, CoreChannelParams } from "../../types";

export type PostMessageParams = CoreChannelParams & {
  _window?: Window;
  source?: Window;
}

export type PostMessageExport = ChannelExport & {
  type: ChannelType,
  peer: ChannelExport['peer'] & {
    origin: string;
  }
}