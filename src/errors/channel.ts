import { SparkError, SparkErrorParams } from "./SparkError";

export enum ChannelErrorName {
  CREATE_RECEIPT_DIGEST_ERROR = 'CREATE_RECEIPT_DIGEST_ERROR',
  CREATE_EVENT_ERROR = 'CREATE_EVENT_ERROR',
  SET_PEER_ERROR = 'SET_PEER_ERROR',
  OPEN_REQUEST_ERROR = 'OPEN_REQUEST_ERROR',
  ON_OPEN_REQUESTED_ERROR = 'ON_OPEN_REQUESTED_ERROR',
  ACCEPT_OPEN_ERROR = 'ACCEPT_OPEN_ERROR',
  REJECT_OPEN_ERROR = 'REJECT_OPEN_ERROR',
  ON_OPEN_ACCEPTED_ERROR = 'ON_OPEN_ACCEPTED_ERROR',
  CONFIRM_OPEN_ERROR = 'CONFIRM_OPEN_ERROR',
  OPEN_CONFIRMED_ERROR = 'OPEN_CONFIRMED_ERROR',
  OPEN_REJECTED_ERROR = 'OPEN_REJECTED_ERROR',
  COMPLETE_OPEN_ERROR = 'COMPLETE_OPEN_ERROR',
  CLOSE_ERROR = 'CLOSE_ERROR',
  ON_CLOSED_ERROR = 'ON_CLOSED_ERROR',
  ON_CLOSE_CONFIRMED_ERROR = 'ON_CLOSE_CONFIRMED_ERROR',
  CONFIRM_CLOSE_ERROR = 'CONFIRM_CLOSE_ERROR',
  COMPLETE_CLOSE_ERROR = 'COMPLETE_CLOSE_ERROR',
  CREATE_MESSAGE_DIGEST_ERROR = 'CREATE_MESSAGE_DIGEST_ERROR',
  OPEN_MESSAGE_DIGEST_ERROR = 'OPEN_MESSAGE_DIGEST_ERROR',
  MESSAGE_SENDING_ERROR = 'MESSAGE_SENDING_ERROR',
  ON_MESSAGE_CONFIRMED_ERROR = 'ON_MESSAGE_CONFIRMED_ERROR',
  CONFIRM_MESSAGE_ERROR = 'CONFIRM_MESSAGE_ERROR',
  COMPLETE_MESSAGE_ERROR = 'COMPLETE_MESSAGE_ERROR',
  HANDLE_REQUEST_ERROR = 'HANDLE_REQUEST_ERROR',
  HANDLE_RESPONSE_ERROR = 'HANDLE_RESPONSE_ERROR',
  ON_MESSAGE_ERROR = 'ON_MESSAGE_ERROR',
  ON_CLOSE_ERROR = 'ON_CLOSE_ERROR',
  ON_ERROR_ERROR = 'ON_ERROR_ERROR',
  GET_EVENT_MESSAGE_ERROR = 'GET_EVENT_MESSAGE_ERROR',
  INVALID_CALLBACK_EVENT_TYPE = 'INVALID_CALLBACK_EVENT_TYPE',
}

export class ChannelErrors {
  public static CreateReceiptDigestError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.CREATE_RECEIPT_DIGEST_ERROR,
      message: `failed to create receipt digest`,
      metadata: { ...metadata },
      stack
    });
  }

  public static CreateEventError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.CREATE_EVENT_ERROR,
      message: `failed to create event`,
      metadata: { ...metadata },
      stack
    });
  }

  public static SetPeerError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.SET_PEER_ERROR,
      message: `failed to set peer`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OpenRequestError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.OPEN_REQUEST_ERROR,
      message: `failed to open request`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OnOpenRequestedError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ON_OPEN_REQUESTED_ERROR,
      message: `failed to on open requested`,
      metadata: { ...metadata },
      stack
    });
  }

  public static AcceptOpenError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ACCEPT_OPEN_ERROR,
      message: `failed to accept open`,
      metadata: { ...metadata },
      stack
    });
  }

  public static RejectOpenError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.REJECT_OPEN_ERROR,
      message: `failed to reject open`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OnOpenAcceptedError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ON_OPEN_ACCEPTED_ERROR,
      message: `failed to on open accepted`,
      metadata: { ...metadata },
      stack
    });
  }

  public static ConfirmOpenError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.CONFIRM_OPEN_ERROR,
      message: `failed to confirm open`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OpenConfirmedError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.OPEN_CONFIRMED_ERROR,
      message: `failed to open confirmed`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OpenRejectedError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.OPEN_REJECTED_ERROR,
      message: `failed to open rejected`,
      metadata: { ...metadata },
      stack
    });
  }

  public static CompleteOpenError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.COMPLETE_OPEN_ERROR,
      message: `failed to complete open`,
      metadata: { ...metadata },
      stack
    });
  }

  public static CloseError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.CLOSE_ERROR,
      message: `failed to close`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OnClosedError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ON_CLOSED_ERROR,
      message: `failed to on closed`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OnCloseConfirmedError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ON_CLOSE_CONFIRMED_ERROR,
      message: `failed to on close confirmed`,
      metadata: { ...metadata },
      stack
    });
  }

  public static ConfirmCloseError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.CONFIRM_CLOSE_ERROR,
      message: `failed to confirm close`,
      metadata: { ...metadata },
      stack
    });
  }

  public static CompleteCloseError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.COMPLETE_CLOSE_ERROR,
      message: `failed to complete close`,
      metadata: { ...metadata },
      stack
    });
  }

  public static CreateMessageDigestError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.CREATE_MESSAGE_DIGEST_ERROR,
      message: `failed to create message digest`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OpenMessageDigestError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.OPEN_MESSAGE_DIGEST_ERROR,
      message: `failed to open message digest`,
      metadata: { ...metadata },
      stack
    });
  }

  public static MessageSendingError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.MESSAGE_SENDING_ERROR,
      message: `failed to send message`,
      metadata: { ...metadata },
      stack
    });
  } 

  public static OnMessageConfirmedError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ON_MESSAGE_CONFIRMED_ERROR,
      message: `failed to process message confirmation`,
      metadata: { ...metadata },
      stack
    });
  }

  public static ConfirmMessageError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.CONFIRM_MESSAGE_ERROR,
      message: `failed to confirm message`,
      metadata: { ...metadata },
      stack
    });
  }

  public static GetEventMessageError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.GET_EVENT_MESSAGE_ERROR,
      message: `failed to get event message`,
      metadata: { ...metadata },
      stack
    });
  }

  public static CompleteMessageError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.COMPLETE_MESSAGE_ERROR,
      message: `failed to complete message`,
      metadata: { ...metadata },
      stack
    });
  }

  public static HandleRequestError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.HANDLE_REQUEST_ERROR,
      message: `failed to handle request`,
      metadata: { ...metadata },
      stack
    });
  }

  public static HandleResponseError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.HANDLE_RESPONSE_ERROR,
      message: `failed to handle response`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OnMessageError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ON_MESSAGE_ERROR,
      message: `failed to on message`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OnCloseError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ON_CLOSE_ERROR,
      message: `failed to on close`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OnErrorError({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ON_ERROR_ERROR,
      message: `failed to on error`,
      metadata: { ...metadata },
      stack
    });
  }

  public static InvalidCallbackEventType({ metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.INVALID_CALLBACK_EVENT_TYPE,
      message: `invalid callback event type`,
      metadata: { ...metadata },
      stack
    });
  }
}

