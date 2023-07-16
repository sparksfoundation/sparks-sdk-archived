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
  ChannelEventLog, ChannelExport, ChannelId, ChannelPeer, ChannelSettings,
  ChannelState, ChannelType, CoreChannelActions, CoreChannelInterface, CoreChannelParams
} from "./types";
import merge from "lodash.merge";

export class CoreChannel extends ChannelEmitter implements CoreChannelInterface<CoreChannelActions> {
  private _channelId: ChannelId;
  private _type: ChannelType;

  private _peer: ChannelPeer;
  private _state: ChannelState;
  private _settings: ChannelSettings;
  private _eventLog: ChannelEventLog;
  private _eventTypes: { [key: string]: ChannelEventType<string> } = {
    ANY_EVENT: 'ANY_EVENT' as ChannelEventType<string>,
  };
  private _requestTypes: { [key: string]: ChannelEventRequestType<string> } = {
    ANY_REQUEST: 'ANY_REQUEST' as ChannelEventRequestType<string>,
  };
  private _confirmTypes: { [key: string]: ChannelEventConfirmType<string> } = {
    ANY_CONFIRM: 'ANY_CONFIRM' as ChannelEventConfirmType<string>,
  };
  private _errorTypes: { [key: string]: ChannelErrorType } = {
    ANY_ERROR: 'ANY_ERROR' as ChannelErrorType,
  };

  private _spark: Spark<any, any, any, any, any>;

  constructor(params: CoreChannelParams) {
    super();

    this._channelId = params.channelId || cuid();
    this._type = params.type;
    this._spark = params.spark;
    this._peer = params.peer || {};
    this._state = { open: false, ...(params.state || {}) }
    this._settings = { timeout: 10000, ...(params.settings || {}) };
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

    this.handleEvent = this.handleEvent.bind(this);
    this.sendEvent = this.sendEvent.bind(this);
  }

  protected get spark() { return this._spark; }
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

  private async logEvent(event, { request = undefined, response = undefined } = {}) {
    if (!event.data && !!event.seal) {
      const publicKey = request ? this.spark.publicKeys.signer : this.peer.publicKeys.signer;
      const opened = await this.spark.signer.open({ signature: event.seal, publicKey });
      const decrypted = await this.spark.cipher.decrypt({ data: opened, sharedKey: this.peer.sharedKey });
      this.eventLog.push({ ...event, data: decrypted, request, response });
    } else {
      this._eventLog.push({ ...event, request, response })
    }
  }

  private requestMethodName(type: ChannelEventType<string>) {
    const base = type.replace('_REQUEST', '').replace('_CONFIRM', '');
    const requestMethod = base.toLowerCase().replace(/_(.)/g, function (match, group1) {
      return group1.toUpperCase();
    });
    return requestMethod;
  }

  private confirmMethodName(type: ChannelEventType<string>) {
    const requestMethod = this.requestMethodName(type);
    const confirmMethod = `confirm${requestMethod.charAt(0).toUpperCase() + requestMethod.slice(1)}`;
    return confirmMethod;
  }

  private confirmTypeFromType(type): ChannelEventConfirmType<string> {
    const base = type.replace('_REQUEST', '').replace('_CONFIRM', '');
    const confirmType = `${base}_CONFIRM`;
    return this.confirmTypes[confirmType];
  }

  protected async dispatchRequest(request: ChannelRequestEvent): Promise<ChannelConfirmEvent> {
    return new Promise(async (resolve, reject) => {
      try {
        let timer: NodeJS.Timeout;

        const confirmType = this.confirmTypeFromType(request.type);

        const onConfirmed = async (confirm: ChannelConfirmEvent) => {
          clearTimeout(timer);
          return resolve(confirm);
        }

        const onTimeout = () => {
          clearTimeout(timer);
          const timeoutError = ChannelErrors.ConfirmTimeoutError({ metadata: { channelId: this.channelId, eventType: request.type } });
          this.emit(ChannelErrorType.CONFIRM_TIMEOUT_ERROR, timeoutError);
          return reject(timeoutError);
        }

        if (this.settings.timeout) {
          timer = setTimeout(onTimeout, this.settings.timeout);
        }

        this.once(confirmType, onConfirmed);
        await this.logEvent(request, { request: true });
        await this.sendEvent(request);

      } catch (error) {
        console.log(error);
        const eventType = request?.type || 'UNKNOWN_EVENT_TYPE';
        const channelError = (error instanceof ChannelError) ? error : ChannelErrors.DispatchRequestError({ metadata: { channelId: this.channelId, eventType } });
        this.emit(ChannelErrorType.DISPATCH_REQUEST_ERROR, channelError);
        reject(channelError);
      }
    });
  }

  public async handleEvent(params: ChannelEventParams | ChannelErrorParams) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        switch (true) {
          case this.requestTypes.hasOwnProperty(params.type):
            const requestEvent = new ChannelRequestEvent(params as ChannelEventParams);
            await this.logEvent(requestEvent, { response: true });
            const confirmType = this.confirmTypes[requestEvent.type.replace('_REQUEST', '_CONFIRM')];
            const confirmMethod = this.confirmMethodName(confirmType);
            await this[confirmMethod](requestEvent);
            this.emit(requestEvent.type, requestEvent);
            return resolve();
          case this.confirmTypes.hasOwnProperty(params.type):
            const confirmEvent = new ChannelConfirmEvent(params as ChannelEventParams);
            await this.logEvent(confirmEvent, { response: true });
            this.emit(confirmEvent.type, confirmEvent);
            return resolve();
          case this.errorTypes.hasOwnProperty(params.type):
            const error = new ChannelError(params as ChannelErrorParams);
            throw error;
          default:
            return;
        }
      } catch (error) {
        console.log(error);
        const eventType = params?.type || 'UNKNOWN_EVENT_TYPE';
        const channelError = (error instanceof ChannelError) ? error : ChannelErrors.HandleEventError({ metadata: { channelId: this.channelId, eventType } });
        this.emit(ChannelErrorType.HANDLE_EVENT_ERROR, channelError);
        reject(channelError);
      }
    });
  }

  public async sendEvent(event: ChannelEvent) {
    return Promise.resolve();
  }

  public async open(params: Partial<ChannelEventParams> = {}): Promise<ChannelConfirmEvent> {
    if (this.state.open) {
      return Promise.reject(ChannelErrors.ChannelOpenError({ metadata: { channelId: this.channelId } }));
    }

    const type = this.requestTypes.OPEN_REQUEST;
    const metadata = { ...params?.metadata, channelId: this.channelId };
    const data = {
      ...params?.data,
      identifier: this.spark.identifier,
      publicKeys: this.spark.publicKeys,
    };

    const request = new ChannelRequestEvent({ type, metadata, data });
    const confirm = await this.dispatchRequest(request);

    this.peer.identifier = confirm.data.identifier;
    this.peer.publicKeys = confirm.data.publicKeys;
    this.peer.sharedKey = await this.spark.cipher.generateSharedKey({ publicKey: this.peer.publicKeys.cipher });
    this.state.open = true;

    return Promise.resolve(confirm);
  }

  public async confirmOpen(request: ChannelRequestEvent): Promise<ChannelConfirmEvent> {
    const type = this.confirmTypes.OPEN_CONFIRM;
    const { eventId, channelId, ...meta } = request?.metadata;
    const metadata = { ...meta, channelId: this.channelId };
    const data = {
      ...request?.data,
      identifier: this.spark.identifier,
      publicKeys: this.spark.publicKeys,
    };

    this.state.open = true;
    this.peer.identifier = request.data.identifier;
    this.peer.publicKeys = request.data.publicKeys;
    this.peer.sharedKey = await this.spark.cipher.generateSharedKey({ publicKey: this.peer.publicKeys.cipher });

    const confirm = new ChannelConfirmEvent({ type, metadata, data });
    await this.sendEvent(confirm as ChannelConfirmEvent);
    return Promise.resolve(confirm);
  }

  public async close(params: Partial<ChannelEventParams> = {}): Promise<ChannelConfirmEvent> {
    if (!this.state.open) {
      return Promise.reject(ChannelErrors.ChannelClosedError({ metadata: { channelId: this.channelId } }));
    }
    const type = this.requestTypes.CLOSE_REQUEST;
    const metadata = { ...params.metadata, channelId: this.channelId };
    const data = { ...params.data };
    const request = new ChannelRequestEvent({ type, metadata, data });
    const confirm = await this.dispatchRequest(request);
    this.state.open = false;
    return Promise.resolve(confirm);
  }

  public async confirmClose(request: ChannelRequestEvent): Promise<ChannelConfirmEvent> {
    if (!this.state.open) {
      return Promise.reject(ChannelErrors.ChannelClosedError({ metadata: { channelId: this.channelId } }));
    }
    const type = this.confirmTypes.CLOSE_CONFIRM;
    const { eventId, channelId, ...meta } = request?.metadata;
    const metadata = { ...meta, channelId: this.channelId };
    const data = { ...request?.data };
    const confirm = new ChannelConfirmEvent({ type, metadata, data });
    await this.sendEvent(confirm as ChannelConfirmEvent);
    this.state.open = false;
    return Promise.resolve(confirm);
  }

  public async message(message): Promise<ChannelConfirmEvent> {
    const type = this.requestTypes.MESSAGE_REQUEST;
    const metadata = { channelId: this.channelId };
    const data = message;
    const encrypted = await this.spark.cipher.encrypt({ data, sharedKey: this.peer.sharedKey });
    const seal = await this.spark.signer.seal({ data: encrypted });
    const request = new ChannelRequestEvent({ type, metadata, seal });

    if (!this.state.open) {
      return Promise.reject(ChannelErrors.ChannelClosedError({ metadata: { channelId: this.channelId } }));
    }

    const confirm = await this.dispatchRequest(request);
    return Promise.resolve(confirm);
  }

  public async confirmMessage(request: ChannelRequestEvent): Promise<ChannelConfirmEvent> {
    if (!this.state.open) {
      return Promise.reject(ChannelErrors.ChannelClosedError({ metadata: { channelId: this.channelId } }));
    }
    const type = this.confirmTypes.MESSAGE_CONFIRM;
    const { eventId, channelId, ...meta } = request?.metadata;
    const metadata = { ...meta, channelId: this.channelId };

    const opened = await this.spark.signer.open({ signature: request.seal, publicKey: this.peer.publicKeys.signer });
    const decrypted = await this.spark.cipher.decrypt({ data: opened, sharedKey: this.peer.sharedKey });

    const sealData = {
      type: request.type,
      timestamp: request.timestamp,
      metadata: request.metadata,
      data: decrypted,
    };

    const encrypted = await this.spark.cipher.encrypt({ data: sealData, sharedKey: this.peer.sharedKey });
    const seal = await this.spark.signer.seal({ data: encrypted });
    const confirm = new ChannelConfirmEvent({ type, metadata, seal });
    await this.sendEvent(confirm as ChannelConfirmEvent);
    return Promise.resolve(confirm);
  }

  public async getEventData(event: ChannelEvent): Promise<ChannelEventData> {
    const { data, seal } = event;
    if (!!data) return data;

    let opened, decrypted;
    try {
      opened = await this.spark.signer.open({ signature: seal, publicKey: this.peer.publicKeys.signer })
        .catch(() => { });

      opened = opened || await this.spark.signer.open({ signature: seal, publicKey: this.peer.publicKeys.signer })
        .catch(() => { });

      decrypted = await this.spark.cipher.decrypt({ data: opened, sharedKey: this.peer.sharedKey })
        .catch(() => { });

      decrypted = decrypted || await this.spark.cipher.decrypt({ data: opened, sharedKey: this.peer.sharedKey })
        .catch(() => { });

      return decrypted;
    } catch (error) { }
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
}
