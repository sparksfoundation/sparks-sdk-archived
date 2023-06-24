import { Identifier, PublicKeys } from "../../controllers";
import { SparksChannel } from "./types";
import { ISpark } from "../../Spark";
export interface IChannel {
}
export declare class Channel implements IChannel {
    private promises;
    private requestHandler;
    private messageHandler;
    private spark;
    private sharedKey;
    private pendingMessages;
    opened: boolean;
    eventLog: SparksChannel.EventLog;
    cid: SparksChannel.Cid;
    peer: {
        identifier: Identifier;
        publicKeys: PublicKeys;
    };
    constructor({ spark, cid }: {
        cid?: SparksChannel.Cid;
        spark: ISpark<any, any, any, any, any>;
    });
    private sealData;
    private openCipher;
    private setPeer;
    private getPromise;
    private request;
    handleResponse(event: any): Promise<unknown>;
    private handleResponseError;
    open(): Promise<unknown>;
    private onOpenRequested;
    acceptOpen(requestEvent: any): Promise<unknown>;
    rejectOpen(requestEvent: any): Promise<void>;
    private onOpenAccepted;
    private onOpenConfirmed;
    private completeOpen;
    send(payload: SparksChannel.Message.Data): Promise<unknown>;
    private onMessage;
    private onMessageConfirmed;
    private completeMessage;
    close(): Promise<unknown>;
    private onClose;
    private onCloseConfirmed;
    private completeClose;
    setRequestHandler(callback: SparksChannel.RequestHandler): void;
    setMessageHandler(callback: SparksChannel.Message.Handler): void;
}
