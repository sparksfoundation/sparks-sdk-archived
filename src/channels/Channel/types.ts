import { Channel } from  "./Channel";
import { ISpark } from "../../Spark";
import { SharedEncryptionKey } from "../../ciphers/Cipher/types";
import { PublicKeys, Identifier } from "../../controllers/Controller/types";

export enum ChannelActions {
    CONFIRM = 'confirm',
    ACCEPT = 'accept',
    REJECT = 'reject',
}

export enum ChannelCallbackEvents {
    OPEN = 'open',
    CLOSE = 'close',
    MESSAGE = 'message',
    ERROR = 'error',
}

export enum ChannelTypes {
    POST_MESSAGE = 'post_message',
    WEB_RTC = 'web_rtc',
    WEB_SOCKET = 'web_socket',
    BLUE_TOOTH = 'blue_tooth',
    NFC = 'nfc',
    QR_CODE = 'qr_code',
    REST_API = 'rest_api',
    FETCH_API = 'fetch_api',
}

export enum ChannelEventTypes {
    OPEN_REQUEST = 'open_request',
    OPEN_ACCEPT = 'open_accept',
    OPEN_CONFIRM = 'open_confirm',

    CLOSE_REQUEST = 'close_request',
    CLOSE_CONFIRM = 'close_confirm',

    MESSAGE_SEND = 'message_send',
    MESSAGE_CONFIRM = 'message_confirm',
}

export enum ChannelEventConfirmTypes {
    CLOSE_REQUEST = ChannelEventTypes.CLOSE_REQUEST,
    MESSAGE_SEND = ChannelEventTypes.MESSAGE_SEND,
}

// todo get more granular with error codes
export enum ChannelErrorCodes {
    OPEN_REQUEST_ERROR = 'open_request_error',
    OPEN_ACCEPT_ERROR = 'open_accept_error',
    OPEN_CONFIRM_ERROR = 'open_confirm_error',
    TIMEOUT_ERROR = 'timeout_error',

    CLOSE_REQUEST_ERROR = 'close_request_error',
    CLOSE_CONFIRM_ERROR = 'close_confirm_error',

    MESSAGE_SEND_ERROR = 'message_send_error',
    MESSAGE_CONFIRM_ERROR = 'message_confirm_error',
}

export type ChannelTimeSamp = number; // utc epoch timestamp

// unique identifier for each event
export type ChannelEventId = string;
export type ChannelId = string;

// sent to consumer -- type this better
export type ChannelError = {
  eventId: ChannelEventId;
  error: ChannelErrorCodes;
  message: string;
};

/**
 * ChannelReceiptData - stringified and passed to receiver
 * provides info about channel and peers
 */
export type ChannelReceiptData = {
    channelType: ChannelTypes;  // type of channel
    channelId: ChannelId;       // unique identifier for channel
    timestamp: ChannelTimeSamp; // timestamp of channel request (open)
    peers: ChannelPeers;        // array of peers (identifiers and public keys)
};

export type ChannelReceipt = string; // stringified ChannelReceiptData

/**
 * ChannelRequestEvent
 * Sent by initiator of request: provides propsed channel and peer info
 */
export type ChannelRequestEvent = {
    eventType: ChannelEventTypes.OPEN_REQUEST;
    timestamp: ChannelTimeSamp;     // timestamp of event
    eventId: ChannelEventId;        // unique identifier for event
    channelId: ChannelId;           // unique identifier for channel
    identifier: Identifier;         // identifier of initiator
    publicKeys: PublicKeys;         // public keys of initiator
};

/**
 * ChannelAcceptEvent
 * Send by receiver accepting request: provides peer info
*/
export type ChannelAcceptEvent = {
    eventType: ChannelEventTypes.OPEN_ACCEPT;
    timestamp: ChannelTimeSamp;     // timestamp of event
    eventId: ChannelEventId;        // unique identifier for event
    channelId: ChannelId;           // unique identifier for channel
    receipt: ChannelReceipt;        // stringified ChannelReceipt
    identifier: Identifier;         // identifier of receiver
    publicKeys: PublicKeys;         // public keys of receiver
};

/**
 * ChannelConfirmEvent
 * Send by receiver accepting request: provides peer info and receipt
 */
export type ChannelConfirmEvent = {
    eventType: ChannelEventTypes.OPEN_CONFIRM;
    timestamp: ChannelTimeSamp;     // timestamp of event
    eventId: ChannelEventId;        // unique identifier for event
    channelId: ChannelId;           // unique identifier for channel
    receipt: ChannelReceipt;        // stringified ChannelReceipt
    identifier: Identifier;         // identifier of receiver
    publicKeys: PublicKeys;         // public keys of receiver
};

/**
 * ChannelConfirmPayload
 * Sent by initiator confirming request: provides receipt
 */
export type ChannelCompletePayload = {
    eventType: ChannelEventTypes.OPEN_CONFIRM;
    eventId: ChannelEventId;        // unique identifier for event
    channelId: ChannelId;           // unique identifier for channel
    timestamp: ChannelTimeSamp;     // timestamp of event
    receipt: ChannelReceipt;        // stringified ChannelReceipt
};

/**
 * CompleteChannelArgs
 * The args passed to completeChannel on both sides
 */
export type ChannelCompleteOpenData = {
    channelId: ChannelId;           // unique identifier for channel
    timestamp: ChannelTimeSamp;     // timestamp of event
    receipt: ChannelReceipt;        // stringified ChannelReceipt
    identifier: Identifier;         // identifier of peer
    publicKeys: PublicKeys;         // public keys of peer
    sharedKey: SharedEncryptionKey; // shared key for channel
};

export type ChannelPromiseHandler = any;

export type ChannelPeer = {
    identifier: Identifier;
    publicKeys: PublicKeys;
}

export type ChannelPeers = [
    ChannelPeer,
    ChannelPeer,
];

// these get delivered to consumer (onmessage, onerror, onopen OR receive resolve/reject)
export type ChannelMessage = string | Record<string, any>;
export type ChannelMessageEncrypted = string;
export type ChannelMessageId = string;

export type ChannelMessageEvent = {
    eventType: ChannelEventTypes.MESSAGE_SEND;
    message: ChannelMessageEncrypted; 
    timestamp: ChannelTimeSamp;
    eventId: ChannelEventId;
    channelId: ChannelId;
    messageId: ChannelMessageId;
};

export type ChannelMessageConfirmEvent = {
    eventType: ChannelEventTypes.MESSAGE_CONFIRM;
    receipt: ChannelMessageEncrypted; 
    timestamp: ChannelTimeSamp;
    eventId: ChannelEventId;
    channelId: ChannelId;
    messageId: ChannelMessageId;
};

export type ChannelMessageReceiptData = {
    messageId: ChannelMessageId;  // unique identifier for message
    timestamp: ChannelTimeSamp; // timestamp of message send (open)
    message: ChannelMessage;    // message contents
}

export type ChannelMessagereceipt = string; // stringified ChannelMessageReceiptData

export type ChannelMessageConfirm = {
    eventType: ChannelEventTypes.MESSAGE_CONFIRM;
    timestamp: ChannelTimeSamp;
    eventId: ChannelEventId;
    channelId: ChannelId;
    receipt: ChannelMessagereceipt;
};

export type ChannelCloseEvent = {
    eventType: ChannelEventTypes.CLOSE_REQUEST;
    timestamp: ChannelTimeSamp;
    eventId: ChannelEventId;
    channelId: ChannelId;
};

export type ChannelClosedReceiptData = {
    channelId: ChannelId;       // unique identifier for channel
    channelType: ChannelTypes;  // type of channel
    timestamp: ChannelTimeSamp; // timestamp of channel request (open)
    peers: ChannelPeers;        // array of peers (identifiers and public keys)
}

export type ChannelClosedReceipt = string; // stringified ChannelClosedReceiptData

export type ChannelCloseConfirmationEvent = {
    eventType: ChannelEventTypes.CLOSE_CONFIRM;
    timestamp: ChannelTimeSamp;
    eventId: ChannelEventId;
    channelId: ChannelId;
    receipt: ChannelClosedReceipt;
};

export abstract class AChannel {
    protected channel: Channel;
    protected channelType: ChannelTypes;
    protected spark: ISpark<any, any, any, any, any>;

    constructor(args: { channelType: ChannelTypes, spark: ISpark<any, any, any, any, any>}) {
        const { channelType, spark } = args;
        if (!spark) throw new Error('Channel: missing spark');
        this.spark = spark;
        this.channelType = channelType;
        Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
        this.channel = new Channel(args);
    }

    protected abstract sendMessage(args: any): void;
    protected abstract receiveMessage(args: any): void;

    open(args: any): Promise<any> | never {
        return this.channel.open(args);
    }

    send(args: any): Promise<any> | never {
        return this.channel.send(args);
    }

    on(event: ChannelCallbackEvents, callback: any): void {
        this.channel.on(event, callback);
    }

    off(event: ChannelCallbackEvents, callback: any): void {
        this.channel.off(event, callback);
    }
}