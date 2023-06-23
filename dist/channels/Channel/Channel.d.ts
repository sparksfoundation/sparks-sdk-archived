import { SharedEncryptionKey } from "../../ciphers";
import { Identifier, PublicKeys } from "../../controllers";
import { SparksChannel } from "./types";
import { ISpark } from "../../Spark";
export interface IChannel {
}
export declare class Channel implements IChannel {
    private openingPromises;
    private openingSharedKeys;
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
    private channelError;
    private getSharedKey;
    private channelReceipt;
    private verifyReceipt;
    open(): Promise<unknown>;
    onOpenRequested(requestEvent: SparksChannel.OpenRequestEvent): Promise<unknown>;
    onOpenAccepted(acceptEvent: SparksChannel.OpenAcceptEvent): Promise<void>;
    onOpenConfirmed(confirmEvent: SparksChannel.OpenConfirmEvent): Promise<void>;
    completeOpen(data: any): Promise<void>;
    close(): void;
    send(args: any): void;
    handleError(errorEvent: any): void;
    protected request(event: any): Promise<{
        ok: any;
    }>;
    sendRequests(callback: any): void;
    handleResponses(event: any): void;
}
