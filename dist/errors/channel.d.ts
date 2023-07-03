import { SparkError, SparkErrorParams } from "./SparkError";
export declare enum ChannelErrorName {
    CREATE_RECEIPT_DIGEST_ERROR = "CREATE_RECEIPT_DIGEST_ERROR",
    CREATE_EVENT_ERROR = "CREATE_EVENT_ERROR",
    SET_PEER_ERROR = "SET_PEER_ERROR",
    OPEN_REQUEST_ERROR = "OPEN_REQUEST_ERROR",
    ON_OPEN_REQUESTED_ERROR = "ON_OPEN_REQUESTED_ERROR",
    ACCEPT_OPEN_ERROR = "ACCEPT_OPEN_ERROR",
    REJECT_OPEN_ERROR = "REJECT_OPEN_ERROR",
    ON_OPEN_ACCEPTED_ERROR = "ON_OPEN_ACCEPTED_ERROR",
    CONFIRM_OPEN_ERROR = "CONFIRM_OPEN_ERROR",
    OPEN_CONFIRMED_ERROR = "OPEN_CONFIRMED_ERROR",
    OPEN_REJECTED_ERROR = "OPEN_REJECTED_ERROR",
    COMPLETE_OPEN_ERROR = "COMPLETE_OPEN_ERROR",
    CLOSE_ERROR = "CLOSE_ERROR",
    ON_CLOSED_ERROR = "ON_CLOSED_ERROR",
    ON_CLOSE_CONFIRMED_ERROR = "ON_CLOSE_CONFIRMED_ERROR",
    CONFIRM_CLOSE_ERROR = "CONFIRM_CLOSE_ERROR",
    COMPLETE_CLOSE_ERROR = "COMPLETE_CLOSE_ERROR",
    CREATE_MESSAGE_DIGEST_ERROR = "CREATE_MESSAGE_DIGEST_ERROR",
    OPEN_MESSAGE_DIGEST_ERROR = "OPEN_MESSAGE_DIGEST_ERROR",
    MESSAGE_SENDING_ERROR = "MESSAGE_SENDING_ERROR",
    ON_MESSAGE_CONFIRMED_ERROR = "ON_MESSAGE_CONFIRMED_ERROR",
    CONFIRM_MESSAGE_ERROR = "CONFIRM_MESSAGE_ERROR",
    COMPLETE_MESSAGE_ERROR = "COMPLETE_MESSAGE_ERROR",
    HANDLE_REQUEST_ERROR = "HANDLE_REQUEST_ERROR",
    HANDLE_RESPONSE_ERROR = "HANDLE_RESPONSE_ERROR",
    ON_MESSAGE_ERROR = "ON_MESSAGE_ERROR",
    ON_CLOSE_ERROR = "ON_CLOSE_ERROR",
    ON_ERROR_ERROR = "ON_ERROR_ERROR",
    GET_EVENT_MESSAGE_ERROR = "GET_EVENT_MESSAGE_ERROR"
}
export declare class ChannelErrors {
    static CreateReceiptDigestError({ metadata, stack }?: SparkErrorParams): SparkError;
    static CreateEventError({ metadata, stack }?: SparkErrorParams): SparkError;
    static SetPeerError({ metadata, stack }?: SparkErrorParams): SparkError;
    static OpenRequestError({ metadata, stack }?: SparkErrorParams): SparkError;
    static OnOpenRequestedError({ metadata, stack }?: SparkErrorParams): SparkError;
    static AcceptOpenError({ metadata, stack }?: SparkErrorParams): SparkError;
    static RejectOpenError({ metadata, stack }?: SparkErrorParams): SparkError;
    static OnOpenAcceptedError({ metadata, stack }?: SparkErrorParams): SparkError;
    static ConfirmOpenError({ metadata, stack }?: SparkErrorParams): SparkError;
    static OpenConfirmedError({ metadata, stack }?: SparkErrorParams): SparkError;
    static OpenRejectedError({ metadata, stack }?: SparkErrorParams): SparkError;
    static CompleteOpenError({ metadata, stack }?: SparkErrorParams): SparkError;
    static CloseError({ metadata, stack }?: SparkErrorParams): SparkError;
    static OnClosedError({ metadata, stack }?: SparkErrorParams): SparkError;
    static OnCloseConfirmedError({ metadata, stack }?: SparkErrorParams): SparkError;
    static ConfirmCloseError({ metadata, stack }?: SparkErrorParams): SparkError;
    static CompleteCloseError({ metadata, stack }?: SparkErrorParams): SparkError;
    static CreateMessageDigestError({ metadata, stack }?: SparkErrorParams): SparkError;
    static OpenMessageDigestError({ metadata, stack }?: SparkErrorParams): SparkError;
    static MessageSendingError({ metadata, stack }?: SparkErrorParams): SparkError;
    static OnMessageConfirmedError({ metadata, stack }?: SparkErrorParams): SparkError;
    static ConfirmMessageError({ metadata, stack }?: SparkErrorParams): SparkError;
    static GetEventMessageError({ metadata, stack }?: SparkErrorParams): SparkError;
    static CompleteMessageError({ metadata, stack }?: SparkErrorParams): SparkError;
    static HandleRequestError({ metadata, stack }?: SparkErrorParams): SparkError;
    static HandleResponseError({ metadata, stack }?: SparkErrorParams): SparkError;
    static OnMessageError({ metadata, stack }?: SparkErrorParams): SparkError;
    static OnCloseError({ metadata, stack }?: SparkErrorParams): SparkError;
    static OnErrorError({ metadata, stack }?: SparkErrorParams): SparkError;
}
