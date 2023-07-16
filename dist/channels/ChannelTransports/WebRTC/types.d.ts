import { DataConnection, MediaConnection } from "peerjs";
import { ChannelState, CoreChannelActions, CoreChannelParams } from "../../types";
export type WebRTCParams = CoreChannelParams & {
    connection?: DataConnection;
};
export type WebRTCMediaStreams = {
    call: MediaConnection;
    local: MediaStream;
    remote: MediaStream;
};
export type WebRTCState = ChannelState & {
    streams: WebRTCMediaStreams;
};
export type WebRTCActions = CoreChannelActions | [
    'CALL',
    'HANGUP'
];
