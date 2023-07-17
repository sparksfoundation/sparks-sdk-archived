import { DataConnection, MediaConnection } from "peerjs";
import { ChannelState, CoreChannelActions, CoreChannelParams } from "../../types";
type Nullbale<T> = T | null;
export type WebRTCParams = CoreChannelParams & {
    connection?: DataConnection;
};
export type WebRTCMediaStreams = {
    call: Nullbale<MediaConnection>;
    local: Nullbale<MediaStream>;
    remote: Nullbale<MediaStream>;
};
export type WebRTCState = ChannelState & {
    streamable: boolean;
    streams: WebRTCMediaStreams;
};
export type WebRTCActions = CoreChannelActions | [
    'CALL',
    'HANGUP'
];
export declare const WebRTCActions: readonly ["OPEN", "CLOSE", "MESSAGE", "CALL", "HANGUP"];
export {};
