import { DataConnection, MediaConnection } from "peerjs";
import { SparkChannelParams } from "../SparkChannel/types";
import { Nullable } from "../../utilities/types";
import { ChannelState } from "../SparkChannel/types";
import { SparkChannelActions } from "../SparkChannel/types";

export type WebRTCParams = SparkChannelParams & {
  connection?: DataConnection;
}

export type WebRTCMediaStreams = {
  local: Nullable<MediaStream>,
  remote: Nullable<MediaStream>,
}

export type WebRTCState = ChannelState & {
  streamable: Nullable<boolean>,
  call: Nullable<MediaConnection>,
  streams: WebRTCMediaStreams,
}

export type WebRTCActions = SparkChannelActions | [
  'CALL',
  'HANGUP',
]

export const WebRTCActions = [
  ...SparkChannelActions,
  'CALL',
  'HANGUP',
] as const;