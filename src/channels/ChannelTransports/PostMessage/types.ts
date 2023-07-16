import { ChannelExport, CoreChannelParams } from "../../types";

export type PostMessageParams = CoreChannelParams & {
  _window?: Window;
  source?: Window;
}

export type PostMessageExport = ChannelExport & {
  type: 'PostMessage';
  peer: ChannelExport['peer'] & {
    origin: string;
  }
}