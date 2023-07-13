import { CoreChannel } from "../../CoreChannel";
import { CoreChannelParams, ChannelReceive } from "../../types";
import Peer, { DataConnection } from "peerjs";
import { ChannelConfirmEvent } from "../../ChannelEvent";
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
    private activeCall;
    constructor({ connection, ...params }: WebRTCParams);
    open(): Promise<ChannelConfirmEvent>;
    close(): Promise<ChannelConfirmEvent>;
    message(message: any): Promise<ChannelConfirmEvent>;
    call(): Promise<unknown>;
    hangup(): Promise<ChannelConfirmEvent | undefined>;
    protected sendRequest(event: any): Promise<void>;
    handleResponse(event: any): Promise<void>;
    protected static addressFromIdentifier(identifier: string): string;
    handleCalls: ({ accept, reject }: {
        accept: () => Promise<WebRTCMediaStreams>;
        reject: () => Promise<void>;
    }) => void;
    private _handleCalls;
    private setLocalStream;
    protected static peerjs: Peer;
    static receive: ChannelReceive;
}
