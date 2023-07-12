import cuid from "cuid";
import { ChannelEmitter } from "./ChannelEmitter";
import { ChannelExport, ChannelPeer, ChannelId, ChannelLoggedEvent, CoreChannelParams } from "./types";
import { ChannelConfirmEvent, ChannelEvent, ChannelRequestEvent } from "./ChannelEvent";
import { ChannelError, ChannelErrorType, ChannelErrors } from "../errors/channel";
import { ChannelEventConfirmType, ChannelEventRequestType, ChannelEventType } from "./ChannelEvent/types";
import { ChannelAction } from "./ChannelActions";
import { Spark } from "../Spark";
import { Identifier } from "../controllers/types";
import { PublicKeys } from "../types";
import { CipherPublicKey, EncryptionSharedKey } from "../ciphers/types";

export class CoreChannel extends ChannelEmitter {
    public readonly channelId: ChannelId;
    public readonly eventLog: ChannelLoggedEvent[] = [];
    public peer: ChannelPeer;

    private _spark: Spark<any, any, any, any, any>;
    private _actions: ChannelAction<any>[]
    private _eventTypes: {
        [key: string]: ChannelEventRequestType | ChannelEventConfirmType | ChannelErrorType,
    } = {
            ANY_EVENT: 'ANY_EVENT' as ChannelEventType,
            ANY_ERROR: 'ANY_ERROR' as ChannelErrorType,
            ANY_REQUEST: 'ANY_REQUEST' as ChannelEventRequestType,
            ANY_CONFIRM: 'ANY_CONFIRM' as ChannelEventConfirmType,
        };

    constructor({ spark, actions, channelId, peer }: CoreChannelParams) {
        super();
        this.peer = peer || {} as ChannelPeer;
        this.channelId = channelId || cuid();
        this.eventLog = [];
        this._spark = spark;
        this._actions = actions || [];

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
            channelId: this.channelId,
            peer: this.peer,
            eventLog: this.eventLog,
        }
    }

    private preflightChecks: ((requestEvent: ChannelRequestEvent<boolean>) => void)[] = [];
    public requestPreflight(callback: (requestEvent: ChannelRequestEvent<boolean>) => void) {
        this.preflightChecks.push(callback);
    }

    public dispatchRequest(event: ChannelRequestEvent<boolean>, attempt: number = 1): Promise<ChannelConfirmEvent<boolean>> {
        return new Promise<ChannelConfirmEvent<boolean>>((resolve, reject) => {
            try {
                let timer: NodeJS.Timeout;

                const action = this.getAction(event.type);
                const requestEvent = event as ChannelRequestEvent<boolean>;
                const confirmType = this.toConfirmType(event.type);
                const requetsType = requestEvent.type as ChannelEventRequestType;

                const onConfirmed = (confirmedEvent: ChannelConfirmEvent<boolean>) => {
                    clearTimeout(timer);
                    return resolve(confirmedEvent);
                };

                const onTimeout = () => {
                    this.off(confirmType, onConfirmed);
                    clearTimeout(timer);

                    if (action[requetsType].retries - attempt > 0) {
                        return this.dispatchRequest(event, attempt + 1);
                    }

                    const timeoutError = ChannelErrors.DispatchRequestTimeoutError({
                        metadata: { eventType: requetsType }
                    });

                    this.emit(ChannelErrorType.DISPATCH_REQUEST_TIMEOUT_ERROR, timeoutError);
                    reject(timeoutError);
                }

                if (action[requetsType].timeout) {
                    timer = setTimeout(onTimeout, action[requetsType].timeout);
                }

                this.once(confirmType, onConfirmed);

                for (let preflightCheck of this.preflightChecks) {
                    preflightCheck(requestEvent)
                }

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

    protected async handleResponse(event: ChannelEvent<ChannelEventType, boolean> | ChannelError): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.requestTypes[event.type]) {
                    event = new ChannelRequestEvent({ ...event as ChannelRequestEvent<boolean> });
                } else if (this.confirmTypes[event.type]) {
                    event = new ChannelConfirmEvent({ ...event as ChannelConfirmEvent<boolean> });
                } else {
                    event = new ChannelError(event as ChannelError);
                }
                
                switch (true) {
                    case event instanceof ChannelError:
                        throw event;
                    case event instanceof ChannelRequestEvent:
                        const requestEvent = event as ChannelRequestEvent<boolean>;
                        const requestType = requestEvent.type as ChannelEventRequestType;
                        const confirmType = this.toConfirmType(requestType);
                        const action = this.getAction(requestType);

                        this.eventLog.push({ ...requestEvent, response: true });

                        const confirmEvent = await action[confirmType](requestEvent)
                            .catch((error: Error) => { throw error });

                        this.eventLog.push({ ...confirmEvent, request: true });

                        for (let preflightCheck of this.preflightChecks) {
                            preflightCheck(requestEvent)
                        }

                        this.emit(requestType, requestEvent);
                        
                        this.sendRequest(confirmEvent)
                            .catch((error: Error) => { throw error });

                        resolve();
                        break;
                    case event instanceof ChannelConfirmEvent:
                        const confirmedEvent = event as ChannelConfirmEvent<boolean>;
                        this.eventLog.push({ ...confirmedEvent, response: true });
                        this.emit(confirmedEvent.type, confirmedEvent);
                        resolve();
                        break;
                    default:
                        throw Error('invalid event');
                }
            } catch (error) {
                console.log(error)
                const eventType = event?.type || 'unknown';
                const sparkError = (error instanceof ChannelError) ? error : ChannelErrors.HandleResponseError({ metadata: { eventType }, message: error.message });
                this.emit(ChannelErrorType.HANDLE_RESPONSE_ERROR, sparkError);
                reject(sparkError);
            }
        });
    }

    public async sealEvent(event: ChannelEvent<ChannelEventType, false>): Promise<ChannelEvent<ChannelEventType, true>> {
        const sealed = await event.seal({
            cipher: this._spark.cipher,
            signer: this._spark.signer,
            sharedKey: this.peer.sharedKey
        });
        return sealed;
    }

    public async openEvent(event: ChannelEvent<ChannelEventType, true>): Promise<ChannelEvent<ChannelEventType, false>> {
        const opened = await event.open({
            cipher: this._spark.cipher,
            signer: this._spark.signer,
            sharedKey: this.peer.sharedKey,
            publicKey: this.peer.publicKeys.signer,
        });
        return opened;
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

    protected sendRequest(event: ChannelEvent<ChannelEventType, boolean>): Promise<void> {
        throw Error('sendRequest not implemented');
    }

}