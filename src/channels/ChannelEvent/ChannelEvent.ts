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

export class ChannelEvent<Type extends ChannelEventType, Sealed extends boolean> implements ChannelEventInterface<any, any> {
  public readonly type: ChannelEventInterface<Type, Sealed>['type'];
  public readonly timestamp: ChannelEventInterface<Type, Sealed>['timestamp'];
  public readonly metadata: ChannelEventInterface<Type, Sealed>['metadata'];
  public sealed: ChannelEventInterface<Type, Sealed>['sealed'];
  public data: ChannelEventInterface<Type, Sealed>['data'];

  private static _nextEventId: ChannelNextEventId = cuid();
  public static _getEventIds() {
    const eventId = ChannelEvent._nextEventId;
    const nextEventId = cuid();
    ChannelEvent._nextEventId = nextEventId;
    return { eventId, nextEventId };
  }

  constructor({
    type,
    data,
    sealed = false,
    metadata,
  }: {
    type: ChannelEventInterface<Type, Sealed>['type'],
    sealed?: ChannelEventInterface<Type, Sealed>['sealed'],
    data: ChannelEventInterface<Type, Sealed>['data'],
    metadata: Omit<ChannelEventInterface<Type, Sealed>['metadata'], 'eventId' | 'nextEventId'> & { eventId?: ChannelEventId, nextEventId?: ChannelNextEventId },
  }) {
    this.type = type;

    this.sealed = sealed;
    this.data = data;

    this.timestamp = getUtcEpochTimestamp();

    this.metadata = {
      ...metadata,
      channelId: metadata.channelId,
      eventId: metadata.eventId,
      nextEventId: metadata.nextEventId,
    };

    Object.defineProperties(this, {
      _nextEventId: { enumerable: false, writable: true, },
      _getEventId: { enumerable: false, writable: false, },
      _data: { enumerable: false, writable: true, },
      _sealed: { enumerable: false, writable: true, },
    });
  }

  public async seal({ cipher, signer, sharedKey }: {
    cipher: Spark<any, any, any, any, any>['cipher'],
    signer: Spark<any, any, any, any, any>['signer'],
    sharedKey: EncryptionSharedKey
  }): Promise<ChannelEvent<Type, boolean>> {
    if (this.sealed) return this as ChannelEvent<Type, true>;
    const data = await cipher.encrypt({ data: this.data, sharedKey });
    const sealed: ChannelEventSealedData = await signer.seal({ data });
    this.sealed = true;
    (this as ChannelEvent<Type, true>).data = sealed;
    return this as ChannelEvent<Type, true>;
  }

  public async open({ cipher, signer, publicKey, sharedKey }: {
    cipher: Spark<any, any, any, any, any>['cipher'],
    signer: Spark<any, any, any, any, any>['signer'],
    publicKey: SignerPublicKey,
    sharedKey: EncryptionSharedKey
  }): Promise<ChannelEvent<Type, boolean>> {
    if (!this.sealed) return this as ChannelEvent<Type, false>;
    const data = await signer.open({ signature: this.data, publicKey });
    const opened = await cipher.decrypt({ data, sharedKey });
    this.sealed = false;
    this.data = opened;
    return this as ChannelEvent<Type, false>;
  }
}

export class ChannelRequestEvent<Sealed extends boolean> extends ChannelEvent<ChannelEventRequestType, Sealed> {
  constructor({ type, data, sealed, metadata }: {
    type: ChannelEventInterface<ChannelEventRequestType, boolean>['type'],
    sealed?: boolean,
    data: Sealed extends true ? ChannelEventSealedData : ChannelEventData,
    metadata: Omit<ChannelEventInterface<ChannelEventRequestType, boolean>['metadata'], 'eventId' | 'nextEventId'> & { nextEventId?: ChannelNextEventId },
  }) {
    super({ type, data, sealed, metadata });
  }
}

export class ChannelConfirmEvent<Sealed extends boolean> extends ChannelEvent<ChannelEventConfirmType, Sealed> {
  constructor({ type, data, sealed, metadata }: {
    type: ChannelEventInterface<ChannelEventConfirmType, boolean>['type'],
    sealed?: boolean,
    data: Sealed extends true ? ChannelEventSealedData : ChannelEventData,
    metadata: Omit<ChannelEventInterface<ChannelEventConfirmType, boolean>['metadata'], 'eventId' | 'nextEventId'> & { nextEventId?: ChannelNextEventId },
  }) {
    super({ type, data, sealed, metadata });
  }
}