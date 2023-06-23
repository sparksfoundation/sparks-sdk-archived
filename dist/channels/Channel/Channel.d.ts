import { Identifier, PublicKeys } from "../../controllers";
import { SparksChannel } from "./types";
import { ISpark } from "../../Spark";
export interface IChannel {
}
export declare class Channel implements IChannel {
    private promises;
    private requestHandler;
    private spark;
    private sharedKey;
    private pendingMessages;
    opened: boolean;
    receipts: any[];
    cid: SparksChannel.Cid;
    peer: {
        identifier: Identifier;
        publicKeys: PublicKeys;
    };
    constructor({ spark, cid }: {
        cid?: SparksChannel.Cid;
        spark: ISpark<any, any, any, any, any>;
    });
    private logReceipt;
    private sealReceipt;
    private verifyReceipt;
    private setPeer;
    private getPromise;
    private request;
    handleResponses(event: any): void;
    private onOpenRequested;
    private onOpenAccepted;
    private onOpenConfirmed;
    private completeOpen;
    private onMessageRequest;
    private onMessageConfirmed;
    open(): Promise<unknown>;
    acceptOpen(requestEvent: any): Promise<unknown>;
    rejectOpen(requestEvent: any): Promise<void>;
    send(payload: SparksChannel.Message.Payload): Promise<unknown>;
    close(): void;
    sendRequests(callback: SparksChannel.RequestHandler): void;
}
