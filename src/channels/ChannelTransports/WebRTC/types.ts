import { DataConnection, MediaConnection } from "peerjs";
import { ChannelState, CoreChannelActions, CoreChannelParams } from "../../types";

type Nullbale<T> = T | null;

export type WebRTCParams = CoreChannelParams & {
  connection?: DataConnection;
}

export type WebRTCMediaStreams = {
  local: Nullbale<MediaStream>,
  remote: Nullbale<MediaStream>,
}

export type WebRTCState = ChannelState & {
  streamable: boolean,
  call: Nullbale<MediaConnection>,
  streams: WebRTCMediaStreams,
}

export type WebRTCActions = CoreChannelActions | [
  'CALL',
  'HANGUP',
]

export const WebRTCActions = [
  ...CoreChannelActions,
  'CALL',
  'HANGUP',
] as const;