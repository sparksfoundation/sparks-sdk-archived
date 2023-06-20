import { ChannelError, ChannelEventId, ChannelMessage, ChannelReceipt, ChannelTypes, ChannelActions, ChannelMessageEvent, ChannelClosedReceipt } from "./types";
import { Spark } from "../../Spark";
import { Identifier, PublicKeys } from "../../controllers/Controller/types";
import { SharedEncryptionKey } from "../../ciphers/Cipher/types";
export declare class Channel {
    static OPEN_RETRIES: number;
    static OPEN_TIMEOUT: number;
    static MESSAGE_RETRIES: number;
    static MESSAGE_TIMEOUT: number;
    static CLOSE_TIMEOUT: number;
    protected spark: Spark;
    protected channelType: ChannelTypes;
    protected channelId: ChannelEventId;
    protected identifier: Identifier;
    protected publicKeys: PublicKeys;
    protected sharedKey: SharedEncryptionKey;
    protected receipt: ChannelReceipt;
    protected _promiseHandlers: Map<string, any>;
    protected _preconnectQueue: ChannelMessageEvent[];
    onopen: ((error: Channel) => void) | null;
    onclose: ((error: ChannelClosedReceipt) => void) | null;
    onmessage: ((payload: ChannelMessage) => void) | null;
    onerror: ((error: ChannelError) => void) | null;
    constructor(args: any);
    get publicSigningKey(): string;
    get sharedEncryptionKey(): string;
    open(payload?: any, action?: any, attempts?: number): Promise<Channel | ChannelError>;
    send(payload: any, action?: ChannelActions, attempts?: number): Promise<unknown>;
    close(payload: any, action: any): Promise<unknown>;
    protected sendMessage(event: any): void;
    protected receiveMessage(payload: any): void;
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