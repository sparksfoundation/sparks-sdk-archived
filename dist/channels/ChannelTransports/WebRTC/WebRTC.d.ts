import { CoreChannel } from "../../CoreChannel";
import { CoreChannelParams, ChannelReceive, ChannelState } from "../../types";
import Peer, { DataConnection } from "peerjs";
export type WebRTCMediaStreams = {
    local: MediaStream;
    remote: MediaStream;
};
export type WebRTCParams = CoreChannelParams & {
    connection?: DataConnection;
};
export declare class WebRTC extends CoreChannel {
    readonly type = "WebRTC";
    streams: WebRTCMediaStreams;
    private connection;
    state: ChannelState & {
        streams: {
            local: MediaStream;
            remote: MediaStream;
        };
        streamable: boolean;
    };
    private activeCall;
    constructor({ connection, ...params }: WebRTCParams);
    open(): Promise<import("../../ChannelEvent").ChannelConfirmEvent>;
    close(): Promise<import("../../ChannelEvent").ChannelConfirmEvent>;
    message(message: any): Promise<import("../../ChannelEvent").ChannelConfirmEvent>;
    call(): Promise<unknown>;
    hangup(): Promise<import("../../ChannelEvent").ChannelConfirmEvent | undefined>;
    protected sendRequest(event: any): Promise<void>;
    handleResponse(event: any): Promise<void>;
    protected static addressFromIdentifier(identifier: string): string;
    handleCalls: ({ accept, reject }: {
        accept: () => Promise<WebRTCMediaStreams>;
        reject: () => Promise<void>;
    }) => void;
    private _handleCalls;
    protected static peerjs: Peer;
    static receive: ChannelReceive;
}
