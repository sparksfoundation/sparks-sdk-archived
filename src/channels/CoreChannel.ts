import cuid from "cuid";
import { Spark } from "../Spark";
import { ChannelError, ChannelErrorParams, ChannelErrorType, ChannelErrors } from "../errors/channel";
import { ChannelEmitter } from "./ChannelEmitter";
import { ChannelRequestEvent, ChannelEvent, ChannelConfirmEvent } from "./ChannelEvent";
import {
  ChannelEventConfirmType, ChannelEventData,
  ChannelEventParams, ChannelEventRequestType, ChannelEventType
} from "./ChannelEvent/types";
import {
  ChannelEventLog, ChannelExport, ChannelId, ChannelPeer, ChannelRequestParams, ChannelSettings,
  ChannelState, ChannelType, CoreChannelActions, CoreChannelInterface, CoreChannelParams
} from "./types";
import merge from "lodash.merge";
import toCase from "to-case";
import { SignerPublicKey } from "../signers/types";
import { EncryptedData } from "../ciphers/types";

export class CoreChannel extends ChannelEmitter implements CoreChannelInterface<CoreChannelActions> {
  private _spark: Spark<any, any, any, any, any>;
  private _channelId: ChannelId;
  private _type: ChannelType;
  private _peer: ChannelPeer;
  private _state: ChannelState;
  private _settings: ChannelSettings;
  private _eventLog: ChannelEventLog;
  private _eventTypes: { [key: string]: ChannelEventType<string> } = { ANY_EVENT: 'ANY_EVENT' as ChannelEventType<string> };
  private _requestTypes: { [key: string]: ChannelEventRequestType<string> } = { ANY_REQUEST: 'ANY_REQUEST' as ChannelEventRequestType<string> };
  private _confirmTypes: { [key: string]: ChannelEventConfirmType<string> } = { ANY_CONFIRM: 'ANY_CONFIRM' as ChannelEventConfirmType<string> };
  private _errorTypes: { [key: string]: ChannelErrorType } = { ANY_ERROR: 'ANY_ERROR' as ChannelErrorType };

  constructor(params) {
    super();

    this._channelId = params.channelId || cuid();
    this._type = params.type;
    this._spark = params.spark;
    this._peer = params.peer || {};
    this._state = { open: false, ...(params.state || {}) };
    this._settings = params.settings || {};
    this._eventLog = params.eventLog || [];

    const actions = (params?.actions || []).concat(CoreChannelActions);
    for (const action of actions) {
      this._eventTypes[`${action}_REQUEST`] = `${action}_REQUEST`;
      this._eventTypes[`${action}_CONFIRM`] = `${action}_CONFIRM`;
      this._requestTypes[`${action}_REQUEST`] = `${action}_REQUEST`;
      this._confirmTypes[`${action}_CONFIRM`] = `${action}_CONFIRM`;
    }

    Object.keys(ChannelErrorType).forEach((key) => {
      this._errorTypes[key] = ChannelErrorType[key];
    });

    const sendEvent = this.sendEvent.bind(this);
    this.sendEvent = async (event: ChannelEvent) => {
      await sendEvent(event);
      await this.logEvent(event, { request: true });
    }

    this.sendEvent = this.sendEvent.bind(this);
    this.handleEvent = this.handleEvent.bind(this);
  }

  public get channelId() { return this._channelId; }
  public get type() { return this._type; }
  public get peer() { return this._peer; }
  public get state() { return this._state; }
  public get settings() { return this._settings; }
  public get eventLog() { return this._eventLog; }
  public get eventTypes() { return this._eventTypes; }
  public get requestTypes() { return this._requestTypes; }
  public get confirmTypes() { return this._confirmTypes; }
  public get errorTypes() { return this._errorTypes; }
  protected get spark() { return this._spark; }

  protected async sendEvent(event: ChannelEvent) {
  }

  protected async handleEvent(params: ChannelEventParams | ChannelErrorParams) {
    try {
      switch (true) {
        case this.requestTypes.hasOwnProperty(params.type):
          const request = new ChannelRequestEvent(params as ChannelEventParams);
          const requestHandler = this.getRequestHandlerName(request.type);
          await this.logEvent(request, { response: true });
          await this[requestHandler](request);
          this.emit(request.type, request);
          break;
        case this.confirmTypes.hasOwnProperty(params.type):
          const confirm = new ChannelConfirmEvent(params as ChannelEventParams);
          const confirmHandler = this.getConfirmHandlerName(confirm.type);
          await this.logEvent(confirm, { response: true });
          await this[confirmHandler](confirm);
          this.emit(confirm.type, confirm);
          break;
        case this.errorTypes.hasOwnProperty(params.type):
          throw new ChannelError(params as ChannelErrorParams);
        default:
          break;
      }
    } catch (error) {
      console.log('error handling event', error)
      if (error instanceof ChannelError) {
        this.emit(ChannelErrorType.HANDLE_EVENT_ERROR, error);
        return;
      }
      const eventType = params?.type || 'UNKNOWN_EVENT_TYPE';
      const metadata = { channelId: this.channelId, eventType };
      const handleError = ChannelErrors.HandleEventError({ metadata });
      this.emit(ChannelErrorType.HANDLE_EVENT_ERROR, handleError);
    }
  }

  public async openEventData(data: EncryptedData, signingKey?: SignerPublicKey) {
    if (!data) return data;
    // we can assume that we're trying to open a message from the peer
    const publicKey = signingKey || this.peer.publicKeys.signer;
    const opened = await this.spark.signer.open({ signature: data, publicKey });
    const decrypted = await this.spark.cipher.decrypt({ data: opened, sharedKey: this.peer.sharedKey });
    return decrypted;
  }

  protected async sealEventData(data: ChannelEventData, signingKey?: SignerPublicKey) {
    const encrypted = await this.spark.cipher.encrypt({ data, sharedKey: this.peer.sharedKey });
    const seal = await this.spark.signer.seal({ data: encrypted, signingKey });
    return seal;
  }

  protected async dispatchRequest(request: ChannelRequestEvent, timeout = 5000): Promise<ChannelConfirmEvent> {
    return new Promise<ChannelConfirmEvent>(async (resolve, reject) => {
      const baseType = request.type.replace('_REQUEST', '');
      const confirmType = this.confirmTypes[`${baseType}_CONFIRM`];
      
      const isOpen = this.requestTypes.OPEN_REQUEST === request.type;
      if (!isOpen && !this.state.open) {
        return reject(ChannelErrors.ChannelClosedError({
          metadata: { channelId: this.channelId, eventType: request.type }
        }));
      }

      if (!confirmType) {
        return reject(ChannelErrors.InvalidEventTypeError({
          metadata: { channelId: this.channelId, eventType: request.type }
        }));
      }

      let timer;

      const listener = (confirm: ChannelConfirmEvent) => {
        clearTimeout(timer);
        resolve(confirm);
      }

      this.once(confirmType, listener);

      if (timeout) {
        timer = setTimeout(() => {
          clearTimeout(timer);
          this.off(confirmType, listener);
          const error = ChannelErrors.ConfirmTimeoutError({
            metadata: { channelId: this.channelId, eventType: request.type }
          });
          this.emit(error.type, error);
          reject(error);
        }, timeout);
      }

      this.sendEvent(request);
    });
  }

  public async open(params: ChannelRequestParams = {}): Promise<CoreChannel> {
    return new Promise<CoreChannel>(async (resolve, reject) => {
      const type = this.requestTypes.OPEN_REQUEST;
      const metadata = { ...params?.metadata, channelId: this.channelId };
      const data = {
        ...params?.data,
        identifier: this.spark.identifier,
        publicKeys: this.spark.publicKeys,
      };
      const request = new ChannelRequestEvent({ type, metadata, data });
      this.dispatchRequest(request, params.timeout)
        .then(() => resolve(this))
        .catch((error) => reject(error));
    })
  }

  public async onOpenRequested(request: ChannelRequestEvent) {
    this.state.open = true;
    this.peer.identifier = request.data.identifier;
    this.peer.publicKeys = { ...request.data.publicKeys };
    this.peer.sharedKey = await this.spark.cipher.generateSharedKey({ publicKey: this.peer.publicKeys.cipher });
    await this.confirmOpen(request);
  }

  public async confirmOpen(request: ChannelRequestEvent) {
    const type = this.confirmTypes.OPEN_CONFIRM;
    const { eventId, channelId, ...meta } = request?.metadata;
    const metadata = { ...meta, channelId: this.channelId };
    const receipt = await this.sealEventData(request);

    const data = {
      ...request?.data,
      identifier: this.spark.identifier,
      publicKeys: this.spark.publicKeys,
      receipt,
    };
    
    const confirm = new ChannelConfirmEvent({ type, metadata, data });
    this.sendEvent(confirm as ChannelConfirmEvent);
  }

  public async onOpenConfirmed(confirm: ChannelConfirmEvent) {
    this.peer.identifier = confirm.data.identifier;
    this.peer.publicKeys = { ...confirm.data.publicKeys };
    this.peer.sharedKey = await this.spark.cipher.generateSharedKey({ publicKey: this.peer.publicKeys.cipher });
    this.state.open = true;
  }

  public async close(params: ChannelRequestParams = {}): Promise<ChannelConfirmEvent> {
    return new Promise<ChannelConfirmEvent>(async (resolve, reject) => {
      const type = this.requestTypes.CLOSE_REQUEST;
      const metadata = { ...params.metadata, channelId: this.channelId };
      const data = { ...params.data };
      const request = new ChannelRequestEvent({ type, metadata, data });
      this.dispatchRequest(request, params.timeout)
        .then((confirm) => { resolve(confirm) })
        .catch((error) => {
          // assume closed if we get a timeout error
          this.onCloseConfirmed(null);
          reject(error);
        });
    })
  }

  public async onCloseRequested(request: ChannelRequestEvent) {
    await this.confirmClose(request);
    this.state.open = false;
    setTimeout(() => {
      this.removeAllListeners();
    }, 100)
  }

  public async confirmClose(request: ChannelRequestEvent) {
    if (!this.state.open) {
      throw ChannelErrors.ChannelClosedError({
        metadata: { channelId: this.channelId }
      });
    }
    const type = this.confirmTypes.CLOSE_CONFIRM;
    const { eventId, channelId, ...meta } = request?.metadata;
    const metadata = { ...meta, channelId: this.channelId };
    const receipt = await this.sealEventData(request);
    const data = { ...request?.data, receipt };
    const confirm = new ChannelConfirmEvent({ type, metadata, data });
    await this.sendEvent(confirm as ChannelConfirmEvent);
  }

  public async onCloseConfirmed(confirm: ChannelConfirmEvent) {
    this.state.open = false;
    setTimeout(() => {
      this.removeAllListeners();
    }, 100)
  }

  public async message(message: ChannelEventData | string, options: ChannelRequestParams = {}): Promise<ChannelConfirmEvent> {
    return new Promise<ChannelConfirmEvent>(async (resolve, reject) => {
      const type = this.requestTypes.MESSAGE_REQUEST;
      const metadata = { channelId: this.channelId };
      const seal = await this.sealEventData(message as ChannelEventData);
      const request = new ChannelRequestEvent({ type, metadata, seal });
      const confirm = await this.dispatchRequest(request, options.timeout);
      return resolve(confirm);
    });
  }

  public async onMessageRequested(request: ChannelRequestEvent) {
    await this.confirmMessage(request);
  }

  public async confirmMessage(request: ChannelRequestEvent) {
    if (!this.state.open) {
      throw ChannelErrors.ChannelClosedError({
        metadata: { channelId: this.channelId }
      });
    }
    const type = this.confirmTypes.MESSAGE_CONFIRM;
    const { eventId, channelId, ...meta } = request?.metadata;
    const metadata = { ...meta, channelId: this.channelId };
    const data = await this.openEventData(request.seal);
    const receipt = await this.sealEventData({ ...request, data });
    const confirm = new ChannelConfirmEvent({ type, metadata, data: { receipt } });
    this.sendEvent(confirm as ChannelConfirmEvent);
  }

  public async onMessageConfirmed(confirm: ChannelConfirmEvent) {
    return Promise.resolve();
  }

  public export(): ChannelExport {
    return {
      channelId: this.channelId,
      type: this.type,
      peer: this.peer,
      settings: this.settings,
      eventLog: this.eventLog,
    }
  }

  public async import(data: ChannelExport): Promise<void> {
    this._channelId = data.channelId || this.channelId;
    this._peer = merge(this.peer, data.peer || {});
    this._settings = merge(this.settings, data.settings || {});
    const eventLog = [...this._eventLog, ...data.eventLog]
      .filter((event, index, self) => self.findIndex((e) => e.metadata.eventId === event.metadata.eventId) === index)
      .sort((a, b) => {
        if (a.timestamp < b.timestamp) return -1;
        if (a.timestamp > b.timestamp) return 1;
        return 0;
      });
    this._eventLog = [...eventLog];
    return Promise.resolve();
  }

  private async logEvent(event: ChannelEvent, { request = undefined, response = undefined } = {}) {
    if (!event.data && !!event.seal) {
      const publicKey = request ? this.spark.publicKeys.signer : this.peer.publicKeys.signer;
      const data = await this.openEventData(event.seal, publicKey);
      this.eventLog.push({ ...event, data: data, request, response });
    } else {
      this._eventLog.push({ ...event, request, response })
    }
  }

  private getRequestHandlerName = (type: ChannelEventType<string>) => {
    const baseType = type.replace('_REQUEST', '').replace('_CONFIRM', '');
    const pascalCase = toCase.pascal(baseType);
    return `on${pascalCase}Requested`;
  }

  private getConfirmHandlerName = (type: ChannelEventConfirmType<string>) => {
    const baseType = type.replace('_REQUEST', '').replace('_CONFIRM', '');
    const pascalCase = toCase.pascal(baseType);
    return `on${pascalCase}Confirmed`;
  }
}