import { ISpark } from '../../Spark';
import { SharedEncryptionKey } from '../../ciphers';
import { Identifier, PublicKeys } from '../../controllers';
import { getTimestamp, randomNonce } from '../../utilities';
import { ChannelId, ChannelReceiptData, ChannelErrorTypes, ChannelEventTypes, ChannelEvents, EventId, IChannel, IChannelError, IChannelPrivate, IChannelProtected, IChannelStatic, MessageId } from './types'

export class ChannelError extends Error implements IChannelError {
  public channelId: ChannelId;
  public eventId: EventId;
  public messageId?: MessageId;
  public eventType: ChannelErrorTypes;
  constructor({ channelId, eventId, messageId, eventType, message }: Parameters<IChannelProtected['handleError']>[0]) {
    super(message);
    this.channelId = channelId;
    this.eventId = eventId;
    this.eventType = eventType;
    this.messageId = messageId;
  }
}

export class Channel implements IChannel {
  private spark: ISpark<any, any, any, any, any>;
  private promises: IChannelPrivate['promises'] = new Map();
  private sharedKey: SharedEncryptionKey;

  public channelId: ChannelId;
  public peerIdentifier: Identifier;
  public peerPublicKeys: PublicKeys;
  public channelReceipts: any[] = [];

  constructor(spark) {
    this.spark = spark;
  }

  open(options: Parameters<IChannel['open']>[0] = {}): ReturnType<IChannel['open']> {
    new Promise((resolve, reject) => {
      const eventId = randomNonce(16);
      const channelId = randomNonce(16);
      this.promises.set(eventId, { resolve, reject });

      const event: ChannelEvents.OpenRequested = {
        eventId,
        eventType: ChannelEventTypes.OPEN_REQUESTED,
        channelId,
        timestamp: getTimestamp(),
        identifier: this.spark.identifier,
        publicKeys: this.spark.publicKeys,
        options: options,
      };

      this.outgoing(event)
        .catch((message) => {
          const error = new ChannelError({
            eventId,
            channelId,
            eventType: ChannelErrorTypes.OPEN_REQUESTED_ERROR,
            message
          });
          this.promises.get(eventId).reject(error);
          this.promises.delete(eventId);
        });
    });
  }

  protected onOpenRequested({ eventId, channelId, identifier, publicKeys, options }: ChannelEvents.OpenRequested): ReturnType<IChannelProtected['onOpenRequested']> {
    const details = { eventId, channelId, identifier, publicKeys, options };

    const resolve = (message): Promise<IChannel | IChannelError> => {
      return new Promise((resolve, reject) => {
        this.acceptOpen({ eventId, channelId, identifier, publicKeys, options, message });
        const _resolve = () => { resolve(this) }
        this.promises.set(eventId, { resolve: _resolve, reject });
      })
    }

    const reject = (message) => {
      const error = new ChannelError({
        eventId,
        channelId,
        eventType: ChannelErrorTypes.OPEN_REQUESTED_ERROR,
        message
      });
      this.outgoing(error);
    }

    Channel.accept({ details, resolve, reject });
  }

  protected async acceptOpen({ eventId, channelId, identifier, publicKeys, options, message }: Parameters<IChannelProtected['acceptOpen']>[0]): ReturnType<IChannelProtected['acceptOpen']> {
    const sharedKey = await this.spark.computeSharedKey({ publicKey: publicKeys.encryption });

    const receiptData: ChannelReceiptData = {
      type: ChannelEventTypes.OPEN_CONFIRMED,
      channelId,
      timestamp: getTimestamp(),
      peers: [
        { identifier: this.spark.identifier, publicKeys: this.spark.publicKeys },
        { identifier, publicKeys },
      ]
    }

    const encrypted = await this.spark.encrypt({ sharedKey, data: receiptData });
    const signature = await this.spark.sign({ sharedKey, data: encrypted });

    if (!sharedKey || !encrypted || !signature) {
      const error = new ChannelError({
        eventId,
        channelId,
        eventType: ChannelErrorTypes.OPEN_REQUESTED_ERROR,
        message: 'Failed to compute shared key, encrypt, or sign'
      });

      if (this.promises.has(eventId)) {
        this.promises.get(eventId).reject(error);
        this.promises.delete(eventId);
      }
      
      return;
    }

    const event: ChannelEvents.OpenAccepted = {
      eventId,
      eventType: ChannelEventTypes.OPEN_ACCEPTED,
      channelId,
      timestamp: getTimestamp(),
      identifier: this.spark.identifier,
      publicKeys: this.spark.publicKeys,
      receipt: signature,
      message,
      options: options,
    };

    this.outgoing(event)
      .catch((message) => {
        const error = new ChannelError({
          eventId,
          channelId,
          eventType: ChannelErrorTypes.OPEN_ACCEPTED_ERROR,
          message
        });
        this.promises.get(eventId).reject(error);
        this.promises.delete(eventId);
      });
  }

  protected async onOpenAccepted({ eventId, channelId, timestamp, identifier, publicKeys, receipt, message, options }: ChannelEvents.OpenAccepted): ReturnType<IChannelProtected['onOpenAccepted']> {
    // check receipt
    const sharedKey = await this.spark.computeSharedKey({ publicKey: publicKeys.encryption });
    const opened = await this.spark.verify({ publicKey: publicKeys.signing, data: receipt });
    const receiptData = await this.spark.decrypt({ sharedKey, data: opened });

    if (!sharedKey || !opened || !receiptData) {
      const error = new ChannelError({
        eventId,
        channelId,
        eventType: ChannelErrorTypes.OPEN_ACCEPTED_ERROR,
        message: 'failed to open and decrypt receipt'
      });

      if (this.promises.has(eventId)) {
        this.promises.get(eventId).reject(error);
        this.promises.delete(eventId);
      }

      return;
    }

    const details = { eventId, channelId, timestamp, identifier, publicKeys, receipt, options, message };

    const resolve = (message): Promise<IChannel | IChannelError> => {
      return new Promise((resolve, reject) => {
        this.confirmOpen({ eventId, channelId, timestamp, identifier, publicKeys, receipt, message });
        // setup this connection as a channel then resolve
        this.sharedKey = sharedKey;
        this.peerIdentifier = identifier;
        this.peerPublicKeys = publicKeys;
        this.channelId = channelId;
        this.channelReceipts.push({ data: receiptData, cipher: receipt })

        if (this.promises.has(eventId)) {
          this.promises.get(eventId).resolve(this);
          this.promises.delete(eventId);
        }

        resolve(this);
      })
    }

    const reject = (message) => {
      const error = new ChannelError({
        eventId,
        channelId,
        eventType: ChannelErrorTypes.OPEN_ACCEPTED_ERROR,
        message
      });
      this.outgoing(error);
    }

    Channel.confirm({ details, resolve, reject });
  }

  protected confirmOpen(args: Parameters<IChannelProtected['confirmOpen']>[0]): ReturnType<IChannelProtected['confirmOpen']> {


  }

  protected onOpenConfirmed(args: Parameters<IChannelProtected['onOpenConfirmed']>[0]): ReturnType<IChannelProtected['onOpenConfirmed']> {
    throw new Error('Not implemented');
  }

  send(args: Parameters<IChannel['send']>[0]): ReturnType<IChannel['send']> {
    throw new Error('Not implemented');
  }

  close(args: Parameters<IChannel['close']>[0]): ReturnType<IChannel['close']> {
    throw new Error('Not implemented');
  }

  on(args: Parameters<IChannel['on']>[0], callback: Parameters<IChannel['on']>[1]): ReturnType<IChannel['on']> {
    throw new Error('Not implemented');
  }

  off(args: Parameters<IChannel['off']>[0], callback: Parameters<IChannel['off']>[1]): ReturnType<IChannel['off']> {
    throw new Error('Not implemented');
  }





  protected requestClose(args: Parameters<IChannelProtected['requestClose']>[0]): ReturnType<IChannelProtected['requestClose']> {
    const payload = {}
    this.outgoing({ type: 'CLOSE_REQUESTED', payload })
  }

  protected onCloseRequested(args: Parameters<IChannelProtected['onCloseRequested']>[0]): ReturnType<IChannelProtected['onCloseRequested']> {
    throw new Error('Not implemented');
  }

  protected confirmClose(args: Parameters<IChannelProtected['confirmClose']>[0]): ReturnType<IChannelProtected['confirmClose']> {
    const payload = {}
    this.outgoing({ type: 'CLOSE_CONFIRMED', payload })
  }

  protected onCloseConfirmed(args: Parameters<IChannelProtected['onCloseConfirmed']>[0]): ReturnType<IChannelProtected['onCloseConfirmed']> {
    throw new Error('Not implemented');
  }

  protected sendMessage(args: Parameters<IChannelProtected['sendMessage']>[0]): ReturnType<IChannelProtected['sendMessage']> {
    const payload = {}
    this.outgoing({ type: 'MESSAGE_SENT', payload })
  }

  protected onMessageSent(args: Parameters<IChannelProtected['onMessageSent']>[0]): ReturnType<IChannelProtected['onMessageSent']> {
    throw new Error('Not implemented');
  }

  protected confirmMessage(args: Parameters<IChannelProtected['confirmMessage']>[0]): ReturnType<IChannelProtected['confirmMessage']> {
    const payload = {}
    this.outgoing({ type: 'MESSAGE_RECEIVED', payload })
  }

  protected onMessageConfirmed(args: Parameters<IChannelProtected['onMessageConfirmed']>[0]): ReturnType<IChannelProtected['onMessageConfirmed']> {
    throw new Error('Not implemented');
  }

  protected incoming(args: Parameters<IChannelProtected['incoming']>[0]): ReturnType<IChannelProtected['incoming']> {
    const { type, ...payload } = args
    switch (type) {
      case 'OPEN_REQUESTED':
        this.onOpenRequested(payload)
        break;
      case 'OPEN_ACCEPTED':
        this.onOpenAccepted(payload)
        break;
      case 'OPEN_REJECTED':
        this.onOpenRejected(payload)
        break;
      case 'OPEN_CONFIRMED':
        this.onOpenConfirmed(payload)
        break;
      case 'CLOSE_REQUESTED':
        this.onCloseRequested(payload)
        break;
      case 'CLOSE_CONFIRMED':
        this.onCloseConfirmed(payload)
        break;
      case 'MESSAGE_SENT':
        this.onMessageSent(payload)
        break;
      case 'MESSAGE_RECEIVED':
        this.onMessageConfirmed(payload)
        break;
      default:
        throw new Error('Invalid channel event type')
    }
  }

  protected outgoing(args: Parameters<IChannelProtected['outgoing']>[0]): ReturnType<IChannelProtected['outgoing']> {
    throw new Error('Not implemented');
  }

  static accept(args: Parameters<IChannelStatic['accept']>[0]): ReturnType<IChannelStatic['accept']> {
    throw new Error('Not implemented');
  }

  static confirm(args: Parameters<IChannelStatic['confirm']>[0]): ReturnType<IChannelStatic['confirm']> {
    throw new Error('Not implemented');
  }
}