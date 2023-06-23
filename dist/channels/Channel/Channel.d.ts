import { SharedEncryptionKey } from "../../ciphers";
import { Identifier, PublicKeys } from "../../controllers";
import { SparksChannel } from "./types";
import { ISpark } from "../../Spark";
export interface IChannel {
}
export declare class Channel implements IChannel {
    private openingPromises;
    private messagePromises;
    private requestHandler;
    private spark;
    cid: SparksChannel.Cid;
    peer: {
        identifier: Identifier;
        publicKeys: PublicKeys;
        sharedKey: SharedEncryptionKey;
    };
    receipts: any[];
    accept: (event: any) => boolean;
    constructor({ spark, cid }: {
        cid?: SparksChannel.Cid;
        spark: ISpark<any, any, any, any, any>;
    });
    private logReceipt;
    private sealReceipt;
    private verifyReceipt;
    open(): Promise<unknown>;
    setPeer(event: SparksChannel.Event.OpenRequest | SparksChannel.Event.OpenAccept | SparksChannel.Event.OpenConfirm): Promise<void>;
    onOpenRequested(requestEvent: SparksChannel.Event.OpenRequest): Promise<unknown>;
    onOpenAccepted(acceptEvent: SparksChannel.Event.OpenAccept): Promise<void>;
    onOpenConfirmed(confirmEvent: SparksChannel.Event.OpenConfirm): Promise<void>;
    completeOpen(data: SparksChannel.Event.OpenAccept | SparksChannel.Event.OpenConfirm): Promise<void>;
    send(payload: SparksChannel.Message.Payload): Promise<unknown>;
    onMessageRequest(messageRequest: SparksChannel.Event.MessageRequest): Promise<void>;
    onMessageConfirmed(messageConfirm: SparksChannel.Event.MessageConfirm): Promise<void>;
    close(): void;
    handleError(errorEvent: SparksChannel.Error.Any): void;
    protected request(event: SparksChannel.Event.Any | SparksChannel.Error.Any): Promise<boolean>;
    sendRequests(callback: SparksChannel.RequestHandler): void;
    handleResponses(event: any): void;
}
