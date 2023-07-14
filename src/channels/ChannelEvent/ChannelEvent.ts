import cuid from "cuid";
import { ChannelNextEventId, ChannelEventInterface, ChannelEventRequestType, ChannelEventConfirmType, ChannelEventType, ChannelEventSealedData, ChannelEventData, ChannelEventId } from "./types";
import { Spark } from "../../Spark";
import { EncryptionSharedKey } from "../../ciphers/types";
import { SignerPublicKey } from "../../signers/types";
import { ChannelError } from "../../errors/channel";

function getUtcEpochTimestamp() {
  const data = new Date();
  const utcTimestamp = Date.UTC(
    data.getUTCFullYear(),
    data.getUTCMonth(),
    data.getUTCDate(),
    data.getUTCHours(),
    data.getUTCMinutes(),
    data.getUTCSeconds(),
    data.getUTCMilliseconds(),
  );
  return utcTimestamp;
}

export class ChannelEvent<Type extends ChannelEventType> implements ChannelEventInterface<any> {
  public readonly type: ChannelEventInterface<Type>['type'];
  public readonly timestamp: ChannelEventInterface<Type>['timestamp'];
  public readonly metadata: ChannelEventInterface<Type>['metadata'];
  public seal: ChannelEventInterface<Type>['seal'];
  public data: ChannelEventInterface<Type>['data'];
  private static _nextEventId: ChannelNextEventId = cuid();

  constructor({
    type,
    data,
    seal,
    metadata,
  }: {
    type: ChannelEventInterface<Type>['type'],
    seal?: ChannelEventInterface<Type>['seal'],
    data?: ChannelEventInterface<Type>['data'],
    metadata: Omit<ChannelEventInterface<Type>['metadata'], 'eventId' | 'nextEventId'> & { eventId?: ChannelEventId, nextEventId?: ChannelNextEventId },
  }) {
    this.type = type;

    this.seal = seal;
    this.data = data;

    this.timestamp = getUtcEpochTimestamp();

    const eventId = metadata.eventId && metadata.nextEventId ? metadata.eventId : ChannelEvent._nextEventId;
    const nextEventId = metadata.eventId && metadata.nextEventId ? metadata.nextEventId : cuid();
    ChannelEvent._nextEventId = nextEventId;

    this.metadata = {
      ...metadata,
      channelId: metadata.channelId,
      eventId: eventId,
      nextEventId: nextEventId,
    };
  }

  public async sealData({ cipher, signer, sharedKey }: {
    cipher: Spark<any, any, any, any, any>['cipher'],
    signer: Spark<any, any, any, any, any>['signer'],
    sharedKey: EncryptionSharedKey
  }): Promise<ChannelEvent<Type>> {
    if (this.seal) return this as ChannelEvent<Type>;
    const data = await cipher.encrypt({ data: this.data, sharedKey });
    this.seal = await signer.seal({ data });
    return this as ChannelEvent<Type>;
  }

  public async openData({ cipher, signer, publicKey, sharedKey }: {
    cipher: Spark<any, any, any, any, any>['cipher'],
    signer: Spark<any, any, any, any, any>['signer'],
    publicKey: SignerPublicKey,
    sharedKey: EncryptionSharedKey
  }): Promise<ChannelEvent<Type>> {
    if (!this.seal) return this as ChannelEvent<Type>;
    const data = await signer.open({ signature: this.seal, publicKey });
    const opened = await cipher.decrypt({ data, sharedKey });
    this.data = opened;
    return this as ChannelEvent<Type>;
  }
}

export class ChannelRequestEvent extends ChannelEvent<ChannelEventRequestType> {
  constructor({ type, data, seal, metadata }: {
    type: ChannelEventInterface<ChannelEventRequestType>['type'],
    seal: ChannelEventSealedData,
    data?: ChannelEventData,
    metadata: Omit<ChannelEventInterface<ChannelEventRequestType>['metadata'], 'eventId' | 'nextEventId'> & { nextEventId?: ChannelNextEventId },
  } | {
    type: ChannelEventInterface<ChannelEventRequestType>['type'],
    seal?: undefined,
    data: ChannelEventData,
    metadata: Omit<ChannelEventInterface<ChannelEventRequestType>['metadata'], 'eventId' | 'nextEventId'> & { nextEventId?: ChannelNextEventId },
  }) {
    super({ type, data, seal, metadata });
  }
}

export class ChannelConfirmEvent extends ChannelEvent<ChannelEventConfirmType> {
  constructor({ type, data, seal, metadata }: {
    type: ChannelEventInterface<ChannelEventConfirmType>['type'],
    seal?: ChannelEventSealedData,
    data: ChannelEventData,
    metadata: Omit<ChannelEventInterface<ChannelEventConfirmType>['metadata'], 'eventId' | 'nextEventId'> & { nextEventId?: ChannelNextEventId },
  } | {
    type: ChannelEventInterface<ChannelEventConfirmType>['type'],
    seal: ChannelEventSealedData,
    data?: ChannelEventData,
    metadata: Omit<ChannelEventInterface<ChannelEventConfirmType>['metadata'], 'eventId' | 'nextEventId'> & { nextEventId?: ChannelNextEventId },
  }) {
    super({ type, data, seal, metadata });
  }
}