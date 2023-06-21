import { Channel } from "./Channel";
import { ISpark } from "../../Spark";
import { SharedEncryptionKey } from "../../ciphers/Cipher/types";
import { PublicKeys, Identifier } from "../../controllers/Controller/types";
export declare enum ChannelActions {
    CONFIRM = "confirm",
    ACCEPT = "accept",
    REJECT = "reject"
}
export declare enum ChannelCallbackEvents {
    OPEN = "open",
    CLOSE = "close",
    MESSAGE = "message",
    ERROR = "error"
}
export declare enum ChannelTypes {
    POST_MESSAGE = "post_message",
    WEB_RTC = "web_rtc",
    WEB_SOCKET = "web_socket",
    BLUE_TOOTH = "blue_tooth",
    NFC = "nfc",
    QR_CODE = "qr_code",
    REST_API = "rest_api",
    FETCH_API = "fetch_api"
}
export declare enum ChannelEventTypes {
    OPEN_REQUEST = "open_request",
    OPEN_ACCEPT = "open_accept",
    OPEN_CONFIRM = "open_confirm",
    CLOSE_REQUEST = "close_request",
    CLOSE_CONFIRM = "close_confirm",
    MESSAGE_SEND = "message_send",
    MESSAGE_CONFIRM = "message_confirm"
}
export declare enum ChannelEventConfirmTypes {
    CLOSE_REQUEST = "close_request",
    MESSAGE_SEND = "message_send"
}
export declare enum ChannelErrorCodes {
    OPEN_REQUEST_ERROR = "open_request_error",
    OPEN_ACCEPT_ERROR = "open_accept_error",
    OPEN_CONFIRM_ERROR = "open_confirm_error",
    TIMEOUT_ERROR = "timeout_error",
    CLOSE_REQUEST_ERROR = "close_request_error",
    CLOSE_CONFIRM_ERROR = "close_confirm_error",
    MESSAGE_SEND_ERROR = "message_send_error",
    MESSAGE_CONFIRM_ERROR = "message_confirm_error"
}
export type ChannelTimeSamp = number;
export type ChannelEventId = string;
export type ChannelId = string;
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
    channelType: ChannelTypes;
    channelId: ChannelId;
    timestamp: ChannelTimeSamp;
    peers: ChannelPeers;
};
export type ChannelReceipt = string;
/**
 * ChannelRequestEvent
 * Sent by initiator of request: provides propsed channel and peer info
 */
export type ChannelRequestEvent = {
    eventType: ChannelEventTypes.OPEN_REQUEST;
    timestamp: ChannelTimeSamp;
    eventId: ChannelEventId;
    channelId: ChannelId;
    identifier: Identifier;
    publicKeys: PublicKeys;
};
/**
 * ChannelAcceptEvent
 * Send by receiver accepting request: provides peer info
*/
export type ChannelAcceptEvent = {
    eventType: ChannelEventTypes.OPEN_ACCEPT;
    timestamp: ChannelTimeSamp;
    eventId: ChannelEventId;
    channelId: ChannelId;
    receipt: ChannelReceipt;
    identifier: Identifier;
    publicKeys: PublicKeys;
};
/**
 * ChannelConfirmEvent
 * Send by receiver accepting request: provides peer info and receipt
 */
export type ChannelConfirmEvent = {
    eventType: ChannelEventTypes.OPEN_CONFIRM;
    timestamp: ChannelTimeSamp;
    eventId: ChannelEventId;
    channelId: ChannelId;
    receipt: ChannelReceipt;
    identifier: Identifier;
    publicKeys: PublicKeys;
};
/**
 * ChannelConfirmPayload
 * Sent by initiator confirming request: provides receipt
 */
export type ChannelCompletePayload = {
    eventType: ChannelEventTypes.OPEN_CONFIRM;
    eventId: ChannelEventId;
    channelId: ChannelId;
    timestamp: ChannelTimeSamp;
    receipt: ChannelReceipt;
};
/**
 * CompleteChannelArgs
 * The args passed to completeChannel on both sides
 */
export type ChannelCompleteOpenData = {
    channelId: ChannelId;
    timestamp: ChannelTimeSamp;
    receipt: ChannelReceipt;
    identifier: Identifier;
    publicKeys: PublicKeys;
    sharedKey: SharedEncryptionKey;
};
export type ChannelPromiseHandler = any;
export type ChannelPeer = {
    identifier: Identifier;
    publicKeys: PublicKeys;
};
export type ChannelPeers = [
    ChannelPeer,
    ChannelPeer
];
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
    messageId: ChannelMessageId;
    timestamp: ChannelTimeSamp;
    message: ChannelMessage;
};
export type ChannelMessagereceipt = string;
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
    channelId: ChannelId;
    channelType: ChannelTypes;
    timestamp: ChannelTimeSamp;
    peers: ChannelPeers;
};
export type ChannelClosedReceipt = string;
export type ChannelCloseConfirmationEvent = {
    eventType: ChannelEventTypes.CLOSE_CONFIRM;
    timestamp: ChannelTimeSamp;
    eventId: ChannelEventId;
    channelId: ChannelId;
    receipt: ChannelClosedReceipt;
};
export declare abstract class AChannel {
    protected channel: Channel;
    protected channelType: ChannelTypes;
    protected spark: ISpark<any, any, any, any, any>;
    constructor(args: {
        channelType: ChannelTypes;
        spark: ISpark<any, any, any, any, any>;
    });
    protected abstract sendMessage(args: any): void;
    protected abstract receiveMessage(args: any): void;
    open(args: any): Promise<any> | never;
    send(args: any): Promise<any> | never;
    on(event: ChannelCallbackEvents, callback: any): void;
    off(event: ChannelCallbackEvents, callback: any): void;
}
