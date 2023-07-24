import { Identifier } from "../../controllers/SparkController/types";
import { createEvent } from "../../events/SparkEvent";
import { EventId } from "../../events/SparkEvent/types";
import { PublicKeys } from "../../spark/types";
import { ChannelId, SignedEncryptedData, SignedReceipt } from "./types";

export const ChannelEventTypes = {
  PING_REQUEST: 'PING_REQUEST',
  PING_CONFIRM: 'PING_CONFIRM',
  OPEN_REQUEST: 'OPEN_REQUEST',
  OPEN_CONFIRM: 'OPEN_CONFIRM',
  CLOSE_REQUEST: 'CLOSE_REQUEST',
  CLOSE_CONFIRM: 'CLOSE_CONFIRM',
  MESSAGE_REQUEST: 'MESSAGE_REQUEST',
  MESSAGE_CONFIRM: 'MESSAGE_CONFIRM',
  CALL_REQUEST: 'CALL_REQUEST',
  CALL_CONFIRM: 'CALL_CONFIRM',
  HANGUP_REQUEST: 'HANGUP_REQUEST',
  HANGUP_CONFIRM: 'HANGUP_CONFIRM',
} as const;

export type ReceiptTypes = {
  OPEN_REQUEST: {
    type: typeof ChannelEventTypes['OPEN_REQUEST'],
    timestamp: number,
    metadata: { eventId: EventId, channelId: ChannelId },
    data: { peers: Identifier[] }
  },
  CLOSE_REQUEST: {
    type: typeof ChannelEventTypes['CLOSE_REQUEST'],
    timestamp: number,
    metadata: { eventId: EventId, channelId: ChannelId },
    data: { peers: Identifier[] }
  },
  MESSAGE_REQUEST: {
    type: typeof ChannelEventTypes['MESSAGE_REQUEST'],
    timestamp: number,
    metadata: { eventId: EventId, channelId: ChannelId },
    data: { message: string }
  },
  CALL_REQUEST: {
    type: typeof ChannelEventTypes['CALL_REQUEST'],
    timestamp: number,
    metadata: { eventId: EventId, channelId: ChannelId },
  },
  HANGUP_REQUEST: {
    type: typeof ChannelEventTypes['HANGUP_REQUEST'],
    timestamp: number,
    metadata: { eventId: EventId, channelId: ChannelId },
  },
}

export type DigestTypes = {
  MESSAGE_REQUEST: {
    message: string,
  },
  MESSAGE_CONFIRM: {
    receipt: SignedReceipt<any, ReceiptTypes['MESSAGE_REQUEST']>
  },
}

export const ChannelEvents = {
  PING_REQUEST: ({ metadata }: {
    metadata: { channelId: ChannelId }
  }) => createEvent({
    type: ChannelEventTypes.PING_REQUEST,
    metadata: { ...metadata },
    data: {}
  }),
  PING_CONFIRM: ({ metadata }: {
    metadata: { channelId: ChannelId }
  }) => createEvent({
    type: ChannelEventTypes.PING_CONFIRM,
    metadata: { ...metadata },
    data: {}
  }),
  OPEN_REQUEST: ({ metadata, data }: {
    metadata: { channelId: ChannelId },
    data: { identifier: Identifier, publicKeys: PublicKeys, [key: string]: any }
  }) => createEvent({
    type: ChannelEventTypes.OPEN_REQUEST,
    metadata: { ...metadata },
    data: { ...data }
  }),
  OPEN_CONFIRM: <Receipt>({ metadata, data }: {
    metadata: { channelId: ChannelId },
    data: {
      identifier: Identifier,
      publicKeys: PublicKeys,
      receipt: SignedReceipt<Receipt, ReceiptTypes['OPEN_REQUEST']>
      [key: string]: any
    }
  }) => createEvent({
    type: ChannelEventTypes.OPEN_CONFIRM,
    metadata: { ...metadata },
    data: { ...data }
  }),
  CLOSE_REQUEST: ({ metadata, data }: {
    metadata: { channelId: ChannelId },
    data: Record<string, any>
  }) => createEvent({
    type: ChannelEventTypes.CLOSE_REQUEST,
    metadata: { ...metadata },
    data: { ...data }
  }),
  CLOSE_CONFIRM: <Receipt>({ metadata, data }: {
    metadata: { channelId: ChannelId },
    data: {
      receipt: SignedReceipt<Receipt, ReceiptTypes['CLOSE_REQUEST']>
      [key: string]: any
    }
  }) => createEvent({
    type: ChannelEventTypes.CLOSE_CONFIRM,
    metadata: { ...metadata },
    data: { ...data }
  }),
  MESSAGE_REQUEST: <Digest>({ metadata, digest }: {
    metadata: { channelId: ChannelId },
    digest: SignedEncryptedData<Digest, DigestTypes['MESSAGE_REQUEST']>,
  }) => createEvent({
    type: ChannelEventTypes.MESSAGE_REQUEST,
    metadata: { ...metadata },
    digest,
  }),
  MESSAGE_CONFIRM: <Digest>({ metadata, digest }: {
    metadata: { channelId: ChannelId },
    digest: SignedEncryptedData<Digest, DigestTypes['MESSAGE_CONFIRM']>,
  }) => createEvent({
    type: ChannelEventTypes.MESSAGE_CONFIRM,
    metadata: { ...metadata },
    digest,
  }),
  CALL_REQUEST: ({ metadata, data }: {
    metadata: { channelId: ChannelId },
    data: {},
  }) => createEvent({
    type: ChannelEventTypes.CALL_REQUEST,
    metadata: { ...metadata },
    data: { ...data }
  }),
  CALL_CONFIRM: <Receipt>({ metadata, data }: {
    metadata: { channelId: ChannelId },
    data: {
      receipt: SignedReceipt<Receipt, ReceiptTypes['CALL_REQUEST']>
    }
  }) => createEvent({
    type: ChannelEventTypes.CALL_CONFIRM,
    metadata: { ...metadata },
    data: { ...data }
  }),
  HANGUP_REQUEST: ({ metadata, data }: {
    metadata: { channelId: ChannelId },
    data: {},
  }) => createEvent({
    type: ChannelEventTypes.HANGUP_REQUEST,
    metadata: { ...metadata },
    data: { ...data }
  }),
  HANGUP_CONFIRM: <Receipt>({ metadata, data }: {
    metadata: { channelId: ChannelId },
    data: {
      receipt: SignedReceipt<Receipt, ReceiptTypes['HANGUP_REQUEST']>
    }
  }) => createEvent({
    type: ChannelEventTypes.HANGUP_CONFIRM,
    metadata: { ...metadata },
    data: { ...data }
  }),
}