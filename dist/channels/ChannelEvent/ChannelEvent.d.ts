import { ChannelNextEventId, ChannelEventInterface, ChannelEventRequestType, ChannelEventConfirmType, ChannelEventType, ChannelEventSealedData, ChannelEventData } from "./types";
import { Spark } from "../../Spark";
import { EncryptionSharedKey } from "../../ciphers/types";
import { SignerPublicKey } from "../../signers/types";
import { ChannelError } from "../../errors/channel";
export declare function eventFromResponse(payload: any): ChannelError | ChannelEvent<any, any>;
export declare class ChannelEvent<Type extends ChannelEventType, Sealed extends boolean> implements ChannelEventInterface<any, any> {
    readonly type: ChannelEventInterface<Type, Sealed>['type'];
    readonly timestamp: ChannelEventInterface<Type, Sealed>['timestamp'];
    readonly metadata: ChannelEventInterface<Type, Sealed>['metadata'];
    sealed: ChannelEventInterface<Type, Sealed>['sealed'];
    data: ChannelEventInterface<Type, Sealed>['data'];
    private _nextEventId;
    private _getEventId;
    constructor({ type, data, sealed, metadata, }: {
        type: ChannelEventInterface<Type, Sealed>['type'];
        sealed?: ChannelEventInterface<Type, Sealed>['sealed'];
        data: ChannelEventInterface<Type, Sealed>['data'];
        metadata: Omit<ChannelEventInterface<Type, Sealed>['metadata'], 'eventId' | 'nextEventId'> & {
            nextEventId?: ChannelNextEventId;
        };
    });
    seal({ cipher, signer, sharedKey }: {
        cipher: Spark<any, any, any, any, any>['cipher'];
        signer: Spark<any, any, any, any, any>['signer'];
        sharedKey: EncryptionSharedKey;
    }): Promise<ChannelEvent<Type, boolean>>;
    open({ cipher, signer, publicKey, sharedKey }: {
        cipher: Spark<any, any, any, any, any>['cipher'];
        signer: Spark<any, any, any, any, any>['signer'];
        publicKey: SignerPublicKey;
        sharedKey: EncryptionSharedKey;
    }): Promise<ChannelEvent<Type, boolean>>;
}
export declare class ChannelRequestEvent<Sealed extends boolean> extends ChannelEvent<ChannelEventRequestType, Sealed> {
    constructor({ type, data, sealed, metadata }: {
        type: ChannelEventInterface<ChannelEventRequestType, boolean>['type'];
        sealed?: boolean;
        data: Sealed extends true ? ChannelEventSealedData : ChannelEventData;
        metadata: Omit<ChannelEventInterface<ChannelEventRequestType, boolean>['metadata'], 'eventId' | 'nextEventId'> & {
            nextEventId?: ChannelNextEventId;
        };
    });
}
export declare class ChannelConfirmEvent<Sealed extends boolean> extends ChannelEvent<ChannelEventConfirmType, Sealed> {
    constructor({ type, data, sealed, metadata }: {
        type: ChannelEventInterface<ChannelEventConfirmType, boolean>['type'];
        sealed?: boolean;
        data: Sealed extends true ? ChannelEventSealedData : ChannelEventData;
        metadata: Omit<ChannelEventInterface<ChannelEventConfirmType, boolean>['metadata'], 'eventId' | 'nextEventId'> & {
            nextEventId?: ChannelNextEventId;
        };
    });
}
