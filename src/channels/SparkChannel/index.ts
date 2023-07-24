import EventEmitter from "eventemitter3";
import { ChannelErrors } from "../../errors";
import { SparkConfirmEvent, SparkErrorEvent, SparkEvent, SparkRequestEvent, createEvent } from "../../events/SparkEvent";
import { ErrorEventType, EventType } from "../../events/SparkEvent/types";
import { Spark } from "../../spark/Spark";
import { randomCuid, snakeToPascal, validCuid } from "../../utilities";
import { ChannelEventTypes, ChannelEvents, DigestTypes, ReceiptTypes } from "./events";
import { ChannelExport, ChannelId, ChannelLoggedEvent, ChannelPeer, ChannelState, ChannelType, OnConfirmMethod, OnRequestMethod, RequestOptions, RequestParams, SparkChannelActions, SparkChannelInterface } from "./types";
import { SignerPublicKey } from "../../signers/SparkSigner/types";

export abstract class SparkChannel extends EventEmitter implements SparkChannelInterface<SparkChannelActions> {
  protected _spark: Spark<any, any, any, any, any>;
  private _channelId: ChannelId;
  private _type: ChannelType;
  private _peer: ChannelPeer;
  private _state: ChannelState;
  private _eventLog: ChannelLoggedEvent[];
  private _eventTypes: {
    ANY_EVENT: 'ANY_EVENT',
    ANY_REQUEST: 'ANY_REQUEST',
    ANY_CONFIRM: 'ANY_CONFIRM',
    ANY_ERROR: 'ANY_ERROR',
  } & { [key: string]: EventType };

  constructor(params: {
    type: ChannelType,
    spark: Spark<any, any, any, any, any>,
    channelId?: ChannelId,
    peer?: ChannelPeer,
    state?: ChannelState,
    eventLog?: ChannelLoggedEvent[],
    actions?: string[],
  }) {
    super();

    this._spark = params.spark;

    this._channelId = params.channelId || randomCuid();
    this._type = params.type;
    this._spark = params.spark;
    this._state = { open: false, ...(params.state || {}) };
    this._eventLog = params.eventLog || [];
    if (params.peer) {
      this._peer = { ...params.peer };
    }

    const actions = (params?.actions || []).concat(SparkChannelActions);

    this._eventTypes = {
      ANY_EVENT: 'ANY_EVENT',
      ANY_REQUEST: 'ANY_REQUEST',
      ANY_CONFIRM: 'ANY_CONFIRM',
      ANY_ERROR: 'ANY_ERROR',
    } as any;
    for (const action of actions) {
      this._eventTypes[`${action}_REQUEST`] = `${action}_REQUEST`;
      this._eventTypes[`${action}_CONFIRM`] = `${action}_CONFIRM`;
      this._eventTypes[`${action}_REQUEST_ERROR`] = `${action}_REQUEST_ERROR`;
      this._eventTypes[`${action}_CONFIRM_ERROR`] = `${action}_CONFIRM_ERROR`;
    }

    const sendEvent = this.sendEvent.bind(this);
    this.sendEvent = async (event: SparkEvent) => {
      await sendEvent(event);
      this.eventLog.push({ event, request: true });
    }

    this.sendEvent = this.sendEvent.bind(this);
    this.handleEvent = this.handleEvent.bind(this);
  }

  get channelId(): ChannelId { return this._channelId; }
  get type(): ChannelType { return this._type; }
  get peer(): ChannelPeer { return this._peer; }
  get state(): ChannelState { return this._state; }
  get eventLog(): ChannelLoggedEvent[] { return this._eventLog; }
  get eventTypes(): { [key: string]: EventType } { return this._eventTypes; }

  private async isValidEventPayload(payload: any = {}) {
    const { type, data, digest, timestamp, metadata } = payload || {};
    if (!type || !(data || digest) || !timestamp || !metadata) return false;
    const validEventType = type && this.eventTypes[type];
    const validPayload = data || digest && !(data && digest);
    const validTimestamp = timestamp && typeof timestamp === 'number';
    const validMetadata = metadata && typeof metadata === 'object';
    const validChannelId = metadata?.channelId === this.channelId && validCuid(metadata?.channelId);
    const validEventId = metadata?.eventId && validCuid(metadata?.eventId);
    return validEventType && validPayload && validTimestamp && validMetadata && validChannelId && validEventId;
  }

  private getRequestMethodName(type: EventType): OnRequestMethod<SparkChannelActions[number]> {
    const baseType = type.replace('_REQUEST', '');
    const camelType = snakeToPascal(baseType);
    return `on${camelType}Requested` as OnRequestMethod<SparkChannelActions[number]>;
  }

  private getConfirmMethodName(type: EventType): OnConfirmMethod<SparkChannelActions[number]> {
    const baseType = type.replace('_CONFIRM', '');
    const camelType = snakeToPascal(baseType);
    return `on${camelType}Confirmed` as OnConfirmMethod<SparkChannelActions[number]>;
  }

  public async getEventData(event: SparkEvent, ourEvent?: boolean) {
    const { data, digest } = event;
    if (!digest && data) return data;
    const publicKey = ourEvent ? this._spark.publicKeys?.signer : this.peer?.publicKeys?.signer;
    const opened = await this._spark.signer.open({ signature: digest, publicKey });
    const decrypted = await this._spark.cipher.decrypt({ data: opened, sharedKey: this.peer.sharedKey });
    return decrypted;
  }

  public async getReceiptData(event: SparkEvent) {
    const data = await this.getEventData(event);
    const { receipt } = data;
    const opened = await this._spark.signer.open({ signature: receipt, publicKey: this.peer?.publicKeys?.signer });
    return opened;
  }

  protected async dispatchRequest(
    event: SparkRequestEvent,
    { timeout = 10000, retries = 0 }: { timeout?: number, retries?: number } = {}
  ): Promise<SparkConfirmEvent> {
    return new Promise((resolve, reject) => {
      const { type, metadata } = event;
      const confirmType = type.replace('_REQUEST', '_CONFIRM');
      const errorType = `${confirmType}_ERROR`;
      let timeoutId: NodeJS.Timer;

      const onConfirm = async (confirm: SparkConfirmEvent) => {
        try {
          if (confirm.type !== confirmType) return;
          const receipt = await this.getReceiptData(confirm);
          if (receipt.metadata.eventId !== metadata.eventId) return;
          clearTimeout(timeoutId);
          this.off(confirmType, onConfirm);
          resolve(confirm);
        } catch(error) {
          reject(error);
        }
      }
      this.on(confirmType, onConfirm);

      const onError = (error: SparkErrorEvent) => {
        const requestId = error.metadata.request.eventId;
        if (requestId !== event.metadata.eventId) return;
        clearTimeout(timeoutId);
        this.off(confirmType, onConfirm);
        this.off(error.type, onError);
        reject(error);
      }
      this.on(errorType, onError);

      timeoutId = setTimeout(() => {
        this.off(confirmType, onConfirm);
        this.off(errorType, onError);

        if (retries > 0) {
          this.dispatchRequest(event, { timeout, retries: retries - 1 })
            .then(resolve)
            .catch(reject);
          return;
        }

        const timeoutError = ChannelErrors.CHANNEL_REQUEST_TIMEOUT_ERROR({
          metadata: { channelId: this.channelId },
          message: `Timeout waiting for ${confirmType} event.`,
        });

        this.emit(timeoutError.type, timeoutError);
        reject(timeoutError);
      }, timeout);

      this.sendEvent(event)
    });
  }

  protected abstract sendEvent(event: SparkEvent): Promise<void>;

  protected async handleEvent(payload: any = {}) {
    try {
      if (!this.isValidEventPayload(payload)) {
        return Promise.resolve();
      }
      
      const { type, data, digest, timestamp, metadata } = payload || {};
      switch (true) {
        case type.endsWith('_REQUEST'):
          const request = new SparkRequestEvent({ type, data, digest, timestamp, metadata });
          const onRequestMethod = this.getRequestMethodName(type);
          await this[onRequestMethod](request);
          this.eventLog.push({ event: request, response: true });
          this.emit(type, request);
          break;
        case type.endsWith('_CONFIRM'):
          const confirm = new SparkConfirmEvent({ type, data, digest, timestamp, metadata });
          const onConfirmMethod = this.getConfirmMethodName(type);
          await this[onConfirmMethod](confirm);
          this.eventLog.push({ event: confirm, response: true });
          this.emit(type, confirm);
          break;
        case type.endsWith('_ERROR'):
          const error = new SparkErrorEvent({ type, data, digest, timestamp, metadata });
          this.emit(type, error);
          break;
      }
    } catch (error: any) {
      console.log(error)
      const type = `${payload.type}_ERROR` as ErrorEventType;
      const metadata = payload.type.endsWith('_REQUEST') ? 
        { channelId: this.channelId, request: payload?.metadata } : 
        { channelId: this.channelId, confirm: payload?.metadata };
      const data = { message: error?.message };
      const errorEvent = createEvent({ type, metadata, data });
      this.emit(type, errorEvent);
      await this.sendEvent(errorEvent);
      return Promise.reject(errorEvent);
    }
  }

  import(params: ChannelExport): void {
    const { channelId, type, peer, eventLog } = params;
    this._channelId = channelId;
    this._type = type;
    this._peer = peer;
    this._eventLog = eventLog;
  }

  export(): ChannelExport {
    return {
      channelId: this.channelId,
      type: this.type,
      peer: this.peer,
      eventLog: this.eventLog,
    }
  }

  async open(params?: RequestParams, options?: RequestOptions) {
    if (!this._spark.identifier || !this._spark.publicKeys || !this._spark.publicKeys.signer || !this._spark.publicKeys.cipher) {
      throw ChannelErrors.CHANNEL_INVALID_PEER_INFO_ERROR({ metadata: { channelId: this.channelId } });
    }

    const request = ChannelEvents.OPEN_REQUEST({
      metadata: { channelId: this.channelId },
      data: {
        identifier: this._spark.identifier,
        publicKeys: this._spark.publicKeys,
        ...(params?.data || {}),
      }
    });

    await this.dispatchRequest(request, options)
    return Promise.resolve(this);
  }

  async onOpenRequested(event: SparkRequestEvent) {
    const { data: { identifier, publicKeys }} = event;

    if (!identifier || !publicKeys || !publicKeys.signer || !publicKeys.cipher) {
      throw ChannelErrors.CHANNEL_INVALID_PEER_INFO_ERROR({ metadata: { channelId: this.channelId } });
    }

    this.peer.sharedKey = await this._spark.cipher.generateSharedKey({ publicKey: publicKeys.cipher });
    this.peer.identifier = identifier;
    this.peer.publicKeys = publicKeys;

    const confirm = await this.confirmOpen(event);
    this.state.open = true;
    return confirm;
  }

  async confirmOpen(event: SparkRequestEvent) {
    const receiptData: ReceiptTypes['OPEN_REQUEST'] = {
      type: ChannelEventTypes.OPEN_REQUEST,
      timestamp: event.timestamp,
      metadata: { channelId: this.channelId, eventId: event.metadata.eventId },
      data: { peers: [ this._spark.identifier, this.peer.identifier ] }
    };

    const confirm = ChannelEvents.OPEN_CONFIRM<typeof receiptData>({
      metadata: { channelId: this.channelId },
      data: {
        identifier: this._spark.identifier,
        publicKeys: this._spark.publicKeys,
        receipt: await this._spark.signer.seal({ data: receiptData }),
      }
    });

    return this.sendEvent(confirm);
  }

  async onOpenConfirmed(event: SparkConfirmEvent) {
    const { data } = event;
    const { identifier, publicKeys, receipt } = data;

    if (!identifier || !publicKeys || !publicKeys.signer || !publicKeys.cipher) {
      throw ChannelErrors.CHANNEL_INVALID_PEER_INFO_ERROR({ metadata: { channelId: this.channelId } });
    }

    this.peer.sharedKey = await this._spark.cipher.generateSharedKey({ publicKey: publicKeys.cipher });
    this.peer.identifier = identifier;
    this.peer.publicKeys = publicKeys;
    this.state.open = true;

    return Promise.resolve();
  }

  async close(params?: RequestParams, options?: RequestOptions): Promise<SparkConfirmEvent> {
    if (!this.state.open) throw ChannelErrors.CHANNEL_CLOSED_ERROR({ metadata: { channelId: this.channelId } });

    const request = ChannelEvents.CLOSE_REQUEST({
      metadata: { channelId: this.channelId },
      data: { ...(params?.data || {}) }
    });

    return this.dispatchRequest(request, options)
  }

  async onCloseRequested(event: SparkRequestEvent) {
    const confirm = await this.confirmClose(event);
    this.state.open = false;
    return confirm;
  }

  async confirmClose(event: SparkRequestEvent) {
    const receiptData: ReceiptTypes['CLOSE_REQUEST'] = {
      type: ChannelEventTypes.CLOSE_REQUEST,
      timestamp: event.timestamp,
      metadata: { channelId: this.channelId, eventId: event.metadata.eventId },
      data: {
        peers: [
          this._spark.identifier,
          this.peer.identifier,
        ]
      }
    };

    const receipt = await this._spark.signer.seal({ data: receiptData })

    const confirm = ChannelEvents.CLOSE_CONFIRM<typeof receiptData>({
      metadata: { channelId: this.channelId },
      data: { receipt }
    });

    return this.sendEvent(confirm);
  }

  async onCloseConfirmed(event: SparkConfirmEvent) {
    this.state.open = false;
    return Promise.resolve();
  }

  async message(message: any, options?: RequestOptions) {
    if (!this.state.open) {
      throw ChannelErrors.CHANNEL_CLOSED_ERROR({ metadata: { channelId: this.channelId } });
    }

    if (!message) {
      throw ChannelErrors.CHANNEL_INVALID_MESSAGE_ERROR({ metadata: { channelId: this.channelId } })
    }

    const data = { message };
    const encrypted = await this._spark.cipher.encrypt({ data, sharedKey: this.peer.sharedKey });
    const digest = await this._spark.signer.seal({ data: encrypted });

    const request = ChannelEvents.MESSAGE_REQUEST<typeof data>({
      metadata: { channelId: this.channelId },
      digest,
    });

    return this.dispatchRequest(request, options);
  }

  async onMessageRequested(event: SparkRequestEvent) {
    await this.confirmMessage(event);
  }

  async confirmMessage(event: SparkRequestEvent) {
    if (!this.state.open) {
      throw ChannelErrors.CHANNEL_CLOSED_ERROR({ metadata: { channelId: this.channelId } });
    }

    const { digest } = event;
    if (!digest) {
      throw ChannelErrors.CHANNEL_INVALID_MESSAGE_ERROR({ metadata: { channelId: this.channelId } });
    }

    const opened = await this._spark.signer.open({ signature: digest, publicKey: this.peer?.publicKeys?.signer });
    const decrypted = await this._spark.cipher.decrypt({ data: opened, sharedKey: this.peer.sharedKey });

    const receiptData: ReceiptTypes['MESSAGE_REQUEST'] = {
      type: ChannelEventTypes.MESSAGE_REQUEST,
      timestamp: event.timestamp,
      metadata: { channelId: this.channelId, eventId: event.metadata.eventId },
      data: decrypted
    };

    const digestData: DigestTypes['MESSAGE_CONFIRM'] = {
      receipt: await this._spark.signer.seal({ data: receiptData }),
    };
    
    const encrypted = await this._spark.cipher.encrypt({ data: digestData, sharedKey: this.peer.sharedKey });
    const confirmDigest = await this._spark.signer.seal({ data: encrypted });

    const confirm = ChannelEvents.MESSAGE_CONFIRM<typeof digestData>({
      metadata: { channelId: this.channelId },
      digest: confirmDigest,
    });

    return this.sendEvent(confirm);
  }

  async onMessageConfirmed(event: SparkConfirmEvent) {
    return Promise.resolve();
  }

  // extend event emitter to accomodate arrays of events for listeners and emitter methods
  emit<T extends string | symbol>(event: T, ...args: any[]): boolean {
    const emitted = super.emit(event, ...args);
    const type = event as EventType;
    
    if (type.endsWith('_REQUEST') || type.endsWith('_CONFIRM')) {
      super.emit('ANY_EVENT', ...args);
    }

    if (type.endsWith('_REQUEST')) {
      super.emit('ANY_REQUEST', ...args);
    }

    if (type.endsWith('_CONFIRM')) {
      super.emit('ANY_CONFIRM', ...args);
    }

    if (type.endsWith('_ERROR')) {
      super.emit('ANY_ERROR', ...args);
    }

    return emitted;
  }

  on<T extends string | symbol>(event: T | T[], listener: (...args: any[]) => void): this {
    if (Array.isArray(event)) {
      for (const e of event) {
        super.on(e, listener);
      }
      return this;
    }
    return super.on(event, listener);
  }

  once<T extends string | symbol>(event: T | T[], listener: (...args: any[]) => void): this {
    if (Array.isArray(event)) {
      for (const e of event) {
        super.once(e, listener);
      }
      return this;
    }
    return super.once(event, listener);
  }

  off<T extends string | symbol>(event: T | T[], listener: (...args: any[]) => void): this {
    if (Array.isArray(event)) {
      for (const e of event) {
        super.off(e, listener);
      }
      return this;
    }
    return super.off(event, listener);
  }

  removeListener<T extends string | symbol>(event: T, fn?: ((...args: any[]) => void) | undefined, context?: any, once?: boolean | undefined): this {
    if (Array.isArray(event)) {
      for (const e of event) {
        super.removeListener(e, fn, context, once);
      }
      return this;
    }
    return super.removeListener(event, fn, context, once);
  }
}