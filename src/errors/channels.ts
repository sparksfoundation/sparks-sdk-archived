import { SparkRequestEvent, createEvent } from "../events/SparkEvent";
import { ConfirmEventType, ErrorEventType, RequestEventType } from "../events/SparkEvent/types";

export const ChannelErrorTypes = {
  CHANNEL_INVALID_PEER_INFO_ERROR: 'CHANNEL_INVALID_PEER_INFO_ERROR',
  CHANNEL_INVALID_MESSAGE_ERROR: 'CHANNEL_INVALID_MESSAGE_ERROR',
  CHANNEL_RECEIPT_ERROR: 'CHANNEL_RECEIPT_ERROR',
  CHANNEL_SEND_EVENT_ERROR: 'CHANNEL_UNEXPECTED_SEND_EVENT_ERROR',
  CHANNEL_HANDLE_EVENT_ERROR: 'CHANNEL_UNEXPECTED_HANDLE_EVENT_ERROR',
  CHANNEL_REQUEST_TIMEOUT_ERROR: 'CHANNEL_TIMEOUT_ERROR',
  CHANNEL_UNEXPECTED_ERROR: 'CHANNEL_UNEXPECTED_ERROR',
  CHANNEL_LOG_EVENT_ERROR: 'CHANNEL_LOG_EVENT_ERROR',
  CHANNEL_CLOSED_ERROR: 'CHANNEL_CLOSED_ERROR',
  CHANNEL_NO_STREAMS_AVAILABLE_ERROR: 'CHANNEL_NO_STREAMS_AVAILABLE_ERROR',
} as const;

export const ChannelErrors = {
  CHANNEL_INVALID_PEER_INFO_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: ChannelErrorTypes.CHANNEL_INVALID_PEER_INFO_ERROR,
    metadata: { ...metadata },
    data: { message: 'Missing peer info.' }
  }),
  CHANNEL_RECEIPT_ERROR: ({ metadata = {}, message }: { metadata?: Record<string, any>, message?: string } = {}) => createEvent({
    type: ChannelErrorTypes.CHANNEL_RECEIPT_ERROR,
    metadata: { ...metadata },
    data: { message: message || 'Invalid receipt.' }
  }),
  CHANNEL_INVALID_MESSAGE_ERROR: ({ metadata = {}, message }: { metadata?: Record<string, any>, message?: string } = {}) => createEvent({
    type: ChannelErrorTypes.CHANNEL_INVALID_MESSAGE_ERROR,
    metadata: { ...metadata },
    data: { message: message || 'Invalid message.' }
  }),
  CHANNEL_UNEXPECTED_ERROR: ({ metadata = {}, message }: { metadata?: Record<string, any>, message?: string } = {}) => createEvent({
    type: ChannelErrorTypes.CHANNEL_UNEXPECTED_ERROR,
    metadata: { ...metadata },
    data: { message: message || 'Unexpected channel error.' }
  }),
  CHANNEL_SEND_EVENT_ERROR: ({ metadata = {}, message }: { metadata?: Record<string, any>, message?: string } = {}) => createEvent({
    type: ChannelErrorTypes.CHANNEL_SEND_EVENT_ERROR,
    metadata: { ...metadata },
    data: { message: message || 'Unexpected send event error.' }
  }),
  CHANNEL_LOG_EVENT_ERROR: ({ metadata = {}, message }: { metadata?: Record<string, any>, message?: string } = {}) => createEvent({
    type: ChannelErrorTypes.CHANNEL_LOG_EVENT_ERROR,
    metadata: { ...metadata },
    data: { message: message || 'Unexpected log event error.' }
  }),
  CHANNEL_CLOSED_ERROR: ({ metadata = {}, message }: { metadata?: Record<string, any>, message?: string } = {}) => createEvent({
    type: ChannelErrorTypes.CHANNEL_CLOSED_ERROR,
    metadata: { ...metadata },
    data: { message: message || 'Channel closed error.' }
  }),
  CHANNEL_REQUEST_TIMEOUT_ERROR: ({ metadata = {}, message }: { metadata?: Record<string, any>, message?: string } = {}) => createEvent({
    type: ChannelErrorTypes.CHANNEL_REQUEST_TIMEOUT_ERROR,
    metadata: { ...metadata },
    data: { message: message || 'Channel timeout error.' }
  }),
  CHANNEL_REJECT_OPEN_REQUEST_ERROR: (request: SparkRequestEvent, message?: string) => createEvent({
    type: 'OPEN_CONFIRM_ERROR',
    metadata: { channelId: request.metadata.channelId, request: request.metadata },
    data: { message: message || 'Channel rejected error.' }
  }),
  CHANNEL_NO_STREAMS_AVAILABLE_ERROR: ({ metadata = {}, message }: { metadata?: Record<string, any>, message?: string } = {}) => createEvent({
    type: ChannelErrorTypes.CHANNEL_NO_STREAMS_AVAILABLE_ERROR,
    metadata: { ...metadata },
    data: { message: message || 'No streams available.' }
  }),
}