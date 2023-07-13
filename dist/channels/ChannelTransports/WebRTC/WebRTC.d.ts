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
    private connection;
    private streams;
    private activeCall;
    constructor({ connection, ...params }: WebRTCParams);
    open(): Promise<ChannelConfirmEvent<boolean>>;
    close(): Promise<ChannelConfirmEvent<boolean>>;
    message(message: any): Promise<ChannelConfirmEvent<boolean>>;
    call(): Promise<unknown>;
    hangup(): Promise<ChannelConfirmEvent<boolean> | undefined>;
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
