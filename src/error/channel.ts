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
  MESSAGE_SENDING_ERROR = 'MESSAGE_SENDING_ERROR',
  ON_MESSAGE_CONFIRMED_ERROR = 'ON_MESSAGE_CONFIRMED_ERROR',
  CONFIRM_MESSAGE_ERROR = 'CONFIRM_MESSAGE_ERROR',
  COMPLETE_MESSAGE_ERROR = 'COMPLETE_MESSAGE_ERROR',
  HANDLE_REQUEST_ERROR = 'HANDLE_REQUEST_ERROR',
  HANDLE_RESPONSE_ERROR = 'HANDLE_RESPONSE_ERROR',
  ON_MESSAGE_ERROR = 'ON_MESSAGE_ERROR',
  ON_CLOSE_ERROR = 'ON_CLOSE_ERROR',
  ON_ERROR_ERROR = 'ON_ERROR_ERROR',
}

export class ChannelErrors {
  public static CreateReceiptDigestError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.CREATE_RECEIPT_DIGEST_ERROR,
      message: `failed to create receipt digest${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static CreateEventError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.CREATE_EVENT_ERROR,
      message: `failed to create event${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static SetPeerError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.SET_PEER_ERROR,
      message: `failed to set peer${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OpenRequestError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.OPEN_REQUEST_ERROR,
      message: `failed to open request${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OnOpenRequestedError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ON_OPEN_REQUESTED_ERROR,
      message: `failed to on open requested${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static AcceptOpenError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ACCEPT_OPEN_ERROR,
      message: `failed to accept open${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static RejectOpenError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.REJECT_OPEN_ERROR,
      message: `failed to reject open${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OnOpenAcceptedError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ON_OPEN_ACCEPTED_ERROR,
      message: `failed to on open accepted${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static ConfirmOpenError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.CONFIRM_OPEN_ERROR,
      message: `failed to confirm open${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OpenConfirmedError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.OPEN_CONFIRMED_ERROR,
      message: `failed to open confirmed${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OpenRejectedError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.OPEN_REJECTED_ERROR,
      message: `failed to open rejected${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static CompleteOpenError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.COMPLETE_OPEN_ERROR,
      message: `failed to complete open${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static CloseError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.CLOSE_ERROR,
      message: `failed to close${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OnClosedError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ON_CLOSED_ERROR,
      message: `failed to on closed${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OnCloseConfirmedError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ON_CLOSE_CONFIRMED_ERROR,
      message: `failed to on close confirmed${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static ConfirmCloseError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.CONFIRM_CLOSE_ERROR,
      message: `failed to confirm close${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static CompleteCloseError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.COMPLETE_CLOSE_ERROR,
      message: `failed to complete close${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static MessageSendingError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.MESSAGE_SENDING_ERROR,
      message: `failed to send message${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  } 

  public static OnMessageConfirmedError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ON_MESSAGE_CONFIRMED_ERROR,
      message: `failed to on message confirmed${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static ConfirmMessageError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.CONFIRM_MESSAGE_ERROR,
      message: `failed to confirm message${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static CompleteMessageError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.COMPLETE_MESSAGE_ERROR,
      message: `failed to complete message${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static HandleRequestError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.HANDLE_REQUEST_ERROR,
      message: `failed to handle request${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static HandleResponseError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.HANDLE_RESPONSE_ERROR,
      message: `failed to handle response${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OnMessageError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ON_MESSAGE_ERROR,
      message: `failed to on message${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OnCloseError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ON_CLOSE_ERROR,
      message: `failed to on close${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }

  public static OnErrorError({ message = '', metadata = {}, stack }: SparkErrorParams = {}): SparkError {
    return new SparkError({
      name: ChannelErrorName.ON_ERROR_ERROR,
      message: `failed to on error${message ? `: ${message}` : ''}`,
      metadata: { ...metadata },
      stack
    });
  }
}

