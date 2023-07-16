import Peer from "peerjs";
import { ChannelConfirmEvent, ChannelRequestEvent } from "../../ChannelEvent";
import { ChannelEventParams } from "../../ChannelEvent/types";
import { CoreChannel } from "../../CoreChannel";
import { ChannelReceive, CoreChannelInterface } from "../../types";
import { WebRTCActions, WebRTCParams, WebRTCState } from "./types";
export declare class WebRTC extends CoreChannel implements CoreChannelInterface<WebRTCActions> {
    private connection;
    get state(): WebRTCState;
    constructor({ connection, ...params }: WebRTCParams);
    getStreamable(): Promise<boolean>;
    private ensurePeerConnection;
    handleEvent(event: ChannelEventParams): Promise<void>;
    sendEvent(event: ChannelEventParams): Promise<void>;
    open(): Promise<ChannelConfirmEvent>;
    close(): Promise<ChannelConfirmEvent>;
    confirmClose(request: ChannelRequestEvent): Promise<ChannelConfirmEvent>;
    call(): Promise<ChannelConfirmEvent>;
    confirmCall(request: ChannelRequestEvent): Promise<ChannelConfirmEvent>;
    private closeStreams;
    hangup(): Promise<ChannelConfirmEvent>;
    confirmHangup(request: ChannelRequestEvent): Promise<ChannelConfirmEvent>;
    protected static peerjs: Peer;
    protected static deriveAddress(identifier: string): string;
    static receive: ChannelReceive;
}
