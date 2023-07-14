import cuid from "cuid";
import { ChannelEmitter } from "./ChannelEmitter";
import { ChannelExport, ChannelPeer, ChannelId, ChannelLoggedEvent, CoreChannelParams, ChannelType } from "./types";
import { ChannelConfirmEvent, ChannelEvent, ChannelRequestEvent } from "./ChannelEvent";
import { ChannelError, ChannelErrorType, ChannelErrors } from "../errors/channel";
import { ChannelEventConfirmType, ChannelEventRequestType, ChannelEventType } from "./ChannelEvent/types";
import { ChannelAction } from "./ChannelActions";
import { Spark } from "../Spark";
import { Identifier } from "../controllers/types";
import { PublicKeys } from "../types";
import { CipherPublicKey, EncryptionSharedKey } from "../ciphers/types";

export class CoreChannel extends ChannelEmitter {
    public static readonly timeout = 2000;
    private readonly timeout: number;

    public readonly channelId: ChannelId;
    public readonly eventLog: ChannelLoggedEvent[] = [];
    public readonly type: ChannelType;

    public peer: ChannelPeer;
    private _spark: Spark<any, any, any, any, any>;
    private _actions: ChannelAction<any>[];
    private _errorTypes: {
        [key: string]: ChannelErrorType,
    } = {
            ANY_ERROR: 'ANY_ERROR' as ChannelErrorType,
        };

    private _eventTypes: {
        [key: string]: ChannelEventRequestType | ChannelEventConfirmType | ChannelErrorType,
    } = {
            ANY_EVENT: 'ANY_EVENT' as ChannelEventType,
            ANY_REQUEST: 'ANY_REQUEST' as ChannelEventRequestType,
            ANY_CONFIRM: 'ANY_CONFIRM' as ChannelEventConfirmType,
        };

    constructor({ spark, actions, channelId, peer, eventLog, timeout }: CoreChannelParams) {
        super();
        this.peer = peer || {} as ChannelPeer;
        this.channelId = channelId || cuid();
        this.eventLog = [...eventLog || []];
        this._spark = spark;
        this._actions = actions || [];
        this.timeout = timeout !== undefined ? timeout : CoreChannel.timeout;

        for (let action of this._actions) {
            action.setContext({ channel: this });
            action.actions.forEach((actionType) => {
                // provide event types
                const requestType = `${actionType}_REQUEST` as ChannelEventRequestType;
                const confirmType = `${actionType}_CONFIRM` as ChannelEventConfirmType;
                this.eventTypes[requestType] = requestType as ChannelEventRequestType;
                this.eventTypes[confirmType] = confirmType as ChannelEventConfirmType;
            });
        }

        // add the error types from channelerror enum
        for (let errorType in ChannelErrorType) {
            this._errorTypes[errorType] = ChannelErrorType[errorType];
        }
    }

    protected getAction(typeOrName: string): ChannelAction<any> {
        const action =
            this._actions.find((action) => action.name === typeOrName) ||
            this._actions.find((action) => action.hasOwnProperty(typeOrName));

        if (!action) throw Error('invalid action');
        return action;
    }

    protected toConfirmType(eventType: ChannelEventRequestType): ChannelEventConfirmType {
        const confirmType = eventType.replace('_REQUEST', '_CONFIRM');
        if (!this._eventTypes[confirmType]) throw Error('invalid request type');
        return confirmType as ChannelEventConfirmType;
    }

    public get eventTypes(): {
        [key: string]: ChannelEventRequestType | ChannelEventConfirmType | ChannelErrorType,
    } {
        return this._eventTypes;
    }

    public get errorTypes(): {
        [key: string]: ChannelErrorType,
    } {
        return this._errorTypes;
    }

    public get requestTypes(): {
        [key: string]: ChannelEventRequestType,
    } {
        const requestTypes = {};
        for (let eventType in this._eventTypes) {
            if (eventType.endsWith('_REQUEST')) {
                requestTypes[eventType] = eventType as ChannelEventRequestType;
            }
        }
        return requestTypes;
    }

    public get confirmTypes(): {
        [key: string]: ChannelEventConfirmType,
    } {
        const confirmTypes = {};
        for (let eventType in this._eventTypes) {
            if (eventType.endsWith('_CONFIRM')) {
                confirmTypes[eventType] = eventType as ChannelEventConfirmType;
            }
        }
        return confirmTypes;
    }

    public export(): ChannelExport {
        return {
            type: this.type,
            channelId: this.channelId,
            peer: this.peer || {},
            eventLog: this.eventLog || [],
        }
    }

    private preflightChecks: ((requestEvent: ChannelRequestEvent) => void)[] = [];
    public requestPreflight(callback: (requestEvent: ChannelRequestEvent) => void) {
        this.preflightChecks.push(callback);
    }

    public dispatchRequest(event: ChannelRequestEvent, attempt: number = 1): Promise<ChannelConfirmEvent> {
        return new Promise<ChannelConfirmEvent>((resolve, reject) => {
            try {
                let timer: NodeJS.Timeout;

                const requestEvent = event as ChannelRequestEvent;
                const confirmType = this.toConfirmType(event.type);
                const requestType = requestEvent.type as ChannelEventRequestType;

                const onConfirmed = (confirmedEvent: ChannelConfirmEvent) => {
                    clearTimeout(timer);
                    return resolve(confirmedEvent);
                };

                const onTimeout = () => {
                    this.off(confirmType, onConfirmed);
                    clearTimeout(timer);
                    const timeoutError = ChannelErrors.DispatchRequestTimeoutError({ metadata: { eventType: requestType } });
                    this.emit(ChannelErrorType.REQUEST_TIMEOUT_ERROR, timeoutError);
                    reject(timeoutError);
                }

                if (this.timeout) {
                    timer = setTimeout(onTimeout, this.timeout);
                }

                this.once(confirmType, onConfirmed);

                for (let preflightCheck of this.preflightChecks) {
                    preflightCheck(requestEvent)
                }

                this.eventLog.push({ ...requestEvent, request: true });

                this.sendRequest(requestEvent)
                    .catch((error: Error) => { throw error });

            } catch (error) {
                console.log(error)
                const eventType = event?.type || 'unknown';
                const sparkError = (error instanceof ChannelError) ? error : ChannelErrors.DispatchRequestError({ metadata: { eventType }, message: error.message });
                this.emit(ChannelErrorType.DISPATCH_REQUEST_ERROR, sparkError);
                reject(sparkError);
            }
        });
    }

    protected async handleResponse(event: ChannelEvent<ChannelEventType> | ChannelError): Promise<void> {
        if (!event.type || (!this.eventTypes[event.type] && !this.errorTypes[event.type])) return;

        return new Promise(async (resolve, reject) => {
            try {
                if (this.requestTypes[event.type]) {
                    event = new ChannelRequestEvent({ ...event as ChannelRequestEvent });
                } else if (this.confirmTypes[event.type]) {
                    event = new ChannelConfirmEvent({ ...event as ChannelConfirmEvent });
                } else {
                    event = new ChannelError(event as ChannelError);
                }

                switch (true) {
                    case event instanceof ChannelError:
                        throw event;
                    case event instanceof ChannelRequestEvent:
                        const requestEvent = event as ChannelRequestEvent;
                        const requestType = requestEvent.type as ChannelEventRequestType;
                        const confirmType = this.toConfirmType(requestType);
                        const action = this.getAction(requestType);

                        this.eventLog.push({ ...requestEvent, response: true });

                        const confirmEvent = await action[confirmType](requestEvent)
                            .catch((error: Error) => { throw error });

                        for (let preflightCheck of this.preflightChecks) {
                            preflightCheck(requestEvent)
                        }

                        this.emit(requestType, requestEvent);

                        this.eventLog.push({ ...confirmEvent, request: true });

                        this.sendRequest(confirmEvent)
                            .catch((error: Error) => { throw error });

                        resolve();
                        break;
                    case event instanceof ChannelConfirmEvent:
                        const confirmedEvent = event as ChannelConfirmEvent;
                        this.eventLog.push({ ...confirmedEvent, response: true });
                        this.emit(confirmedEvent.type, confirmedEvent);
                        resolve();
                        break;
                    default:
                        throw Error('invalid event');
                }
            } catch (error) {
                console.log(error)
                const eventType = event?.type || 'CHANNEL_ERROR';
                const sparkError = (error instanceof ChannelError) ? error : ChannelErrors.HandleResponseError({ metadata: { eventType }, message: error.message });
                this.emit(ChannelErrorType.HANDLE_RESPONSE_ERROR, sparkError);
                reject(sparkError);
            }
        });
    }

    public async sealEvent(event: ChannelEvent<ChannelEventType>): Promise<ChannelEvent<ChannelEventType>> {
        if (!!event.seal) return event;
        return await event.sealData({
            cipher: this._spark.cipher,
            signer: this._spark.signer,
            sharedKey: this.peer.sharedKey
        });
    }

    public async openEvent(event: ChannelEvent<ChannelEventType>): Promise<ChannelEvent<ChannelEventType>> {
        if (!!event.data) return event;
        return await event.openData({
            cipher: this._spark.cipher,
            signer: this._spark.signer,
            sharedKey: this.peer.sharedKey,
            publicKey: this.peer.publicKeys.signer,
        });
    }

    public get identifier(): Identifier {
        return this._spark.identifier;
    }

    public get publicKeys(): PublicKeys {
        return this._spark.publicKeys;
    }

    public get sharedKey(): EncryptionSharedKey {
        return this.peer.sharedKey;
    }

    public async setSharedKey(publicKey: CipherPublicKey): Promise<void> {
        const sharedKey = await this._spark.cipher.generateSharedKey({ publicKey });
        this.peer.sharedKey = sharedKey;
        return Promise.resolve();
    }

    protected sendRequest(event: ChannelEvent<ChannelEventType>): Promise<void> {
        throw Error('sendRequest not implemented');
    }
}