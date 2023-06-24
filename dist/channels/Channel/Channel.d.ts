import { SharedEncryptionKey } from "../../ciphers";
import { Identifier, PublicKeys } from "../../controllers";
import { SparksChannel } from "./types";
import { ISpark } from "../../Spark";
export interface IChannel {
}
export declare class Channel implements IChannel {
    private promises;
    private requestHandler;
    private messageHandler;
    private closeHandler;
    private errorHandler;
    private openHandler;
    private spark;
    private pendingMessages;
    sharedKey: SharedEncryptionKey;
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
    setOpenHandler(callback: SparksChannel.Open.Handler): void;
    setCloseHandler(callback: SparksChannel.Close.Handler): void;
    setErrorHandler(callback: SparksChannel.Error.Handler): void;
}
