import { ChannelError, ChannelEventId, ChannelMessage, ChannelReceipt, ChannelTypes, ChannelActions, ChannelMessageEvent, ChannelClosedReceipt, ChannelCallbackEvents } from "./types";
import { ISpark } from "../../Spark";
import { Identifier, PublicKeys } from "../../controllers/Controller/types";
import { SharedEncryptionKey } from "../../ciphers/Cipher/types";
export declare class Channel {
    static OPEN_RETRIES: number;
    static OPEN_TIMEOUT: number;
    static MESSAGE_RETRIES: number;
    static MESSAGE_TIMEOUT: number;
    static CLOSE_TIMEOUT: number;
    protected spark: ISpark<any, any, any, any, any>;
    protected _promiseHandlers: Map<string, any>;
    protected _preconnectQueue: ChannelMessageEvent[];
    protected _callbacks: Map<string, Set<Function>>;
    channelId: ChannelEventId;
    channelType: ChannelTypes;
    identifier: Identifier;
    publicKeys: PublicKeys;
    sharedKey: SharedEncryptionKey;
    receipt: ChannelReceipt;
    on(event: ChannelCallbackEvents, callback: Function): void;
    off(event: ChannelCallbackEvents, callback: Function): void;
    protected callback(event: ChannelCallbackEvents, ...args: any[]): void;
    onopen: ((error: Channel) => void) | null;
    onclose: ((error: ChannelClosedReceipt) => void) | null;
    onmessage: ((payload: ChannelMessage) => void) | null;
    onerror: ((error: ChannelError) => void) | null;
    constructor(args: any);
    get id(): string;
    get publicSigningKey(): string;
    get sharedEncryptionKey(): string;
    open(payload?: any, action?: any, attempts?: number): Promise<Channel | ChannelError>;
    send(payload: any, action?: ChannelActions, attempts?: number): Promise<unknown>;
    close(payload: any, action: any): Promise<unknown>;
    sendMessage(event: any): void;
    receiveMessage(payload: any): void;
    static receive(callback: any, options: any): void;
    static channelRequest({ payload, Channel, options }: {
        payload: any;
        Channel: any;
        options: any;
    }): {
        resolve: () => Promise<any>;
        reject: (message: any) => void;
        details: any;
    } | null;
}
