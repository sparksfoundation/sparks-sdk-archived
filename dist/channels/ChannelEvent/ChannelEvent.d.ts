import { ChannelNextEventId, ChannelEventInterface, ChannelEventRequestType, ChannelEventConfirmType, ChannelEventType, ChannelEventSealedData, ChannelEventData, ChannelEventId } from "./types";
import { Spark } from "../../Spark";
import { EncryptionSharedKey } from "../../ciphers/types";
import { SignerPublicKey } from "../../signers/types";
export declare class ChannelEvent<Type extends ChannelEventType> implements ChannelEventInterface<any> {
    readonly type: ChannelEventInterface<Type>['type'];
    readonly timestamp: ChannelEventInterface<Type>['timestamp'];
    readonly metadata: ChannelEventInterface<Type>['metadata'];
    seal: ChannelEventInterface<Type>['seal'];
    data: ChannelEventInterface<Type>['data'];
    private static _nextEventId;
    constructor({ type, data, seal, metadata, }: {
        type: ChannelEventInterface<Type>['type'];
        seal?: ChannelEventInterface<Type>['seal'];
        data?: ChannelEventInterface<Type>['data'];
        metadata: Omit<ChannelEventInterface<Type>['metadata'], 'eventId' | 'nextEventId'> & {
            eventId?: ChannelEventId;
            nextEventId?: ChannelNextEventId;
        };
    });
    sealData({ cipher, signer, sharedKey }: {
        cipher: Spark<any, any, any, any, any>['cipher'];
        signer: Spark<any, any, any, any, any>['signer'];
        sharedKey: EncryptionSharedKey;
    }): Promise<ChannelEvent<Type>>;
    openData({ cipher, signer, publicKey, sharedKey }: {
        cipher: Spark<any, any, any, any, any>['cipher'];
        signer: Spark<any, any, any, any, any>['signer'];
        publicKey: SignerPublicKey;
        sharedKey: EncryptionSharedKey;
    }): Promise<ChannelEvent<Type>>;
}
export declare class ChannelRequestEvent extends ChannelEvent<ChannelEventRequestType> {
    constructor({ type, data, seal, metadata }: {
        type: ChannelEventInterface<ChannelEventRequestType>['type'];
        seal: ChannelEventSealedData;
        data?: ChannelEventData;
        metadata: Omit<ChannelEventInterface<ChannelEventRequestType>['metadata'], 'eventId' | 'nextEventId'> & {
            nextEventId?: ChannelNextEventId;
        };
    } | {
        type: ChannelEventInterface<ChannelEventRequestType>['type'];
        seal?: undefined;
        data: ChannelEventData;
        metadata: Omit<ChannelEventInterface<ChannelEventRequestType>['metadata'], 'eventId' | 'nextEventId'> & {
            nextEventId?: ChannelNextEventId;
        };
    });
}
export declare class ChannelConfirmEvent extends ChannelEvent<ChannelEventConfirmType> {
    constructor({ type, data, seal, metadata }: {
        type: ChannelEventInterface<ChannelEventConfirmType>['type'];
        seal?: ChannelEventSealedData;
        data: ChannelEventData;
        metadata: Omit<ChannelEventInterface<ChannelEventConfirmType>['metadata'], 'eventId' | 'nextEventId'> & {
            nextEventId?: ChannelNextEventId;
        };
    } | {
        type: ChannelEventInterface<ChannelEventConfirmType>['type'];
        seal: ChannelEventSealedData;
        data?: ChannelEventData;
        metadata: Omit<ChannelEventInterface<ChannelEventConfirmType>['metadata'], 'eventId' | 'nextEventId'> & {
            nextEventId?: ChannelNextEventId;
        };
    });
}
