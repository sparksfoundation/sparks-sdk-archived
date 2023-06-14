
import { getTimestamp, randomNonce } from '../utilities/index.js';
import { Channel } from './Channel.js';


export enum CHANNEL_EVENTS {
    REQUEST_CONNECTION = 'REQUEST_CONNECTION',
    CONRIM_CONNECTION = 'CONRIM_CONNECTION',
}

export enum CHANNEL_ERRORS {
    PUBLIC_ENCRYPTION_KEY_ERROR = 'PUBLIC_ENCRYPTION_KEY_ERROR',
    CONNECT_REQUEST_OPTION_ERROR = 'CONNECT_REQUEST_OPTION_ERROR',
    CONFIRM_CONNECTION_ERROR = 'CONFIRM_CONNECTION_ERROR',
    CONNECTION_REJECTED_ERROR = 'CONNECTION_REJECTED_ERROR',
}

export type ConnectionRequestOptions = {
    cid: string;
    timestamp: number;
    identifier: string;
    publicKeys: {
        signing: string;
        encryption: string;
    };
}

export type ChannelErrorPayload = {
    error: CHANNEL_ERRORS;
    message: string;
}

export type ChannelArgs = {
    _window?: Window;
    spark: any;
    cid: string;
    origin: string;
    source: Window;
    timestamp: number;
    identifier: string;
    sharedKey: string;
    publicKey: string;
    receipt: string;
}

export type OpenChannelArgs = {
    url: string;
}

export type ChannelRecieptData = {
    cid: string;
    timestamp: number;
    peers: {
        identifier: string;
        publicKeys: {
            signing: string;
            encryption: string;
        };
    }[];
}

export type ChannelReceipt = string;
export type ChannelConfirmWithReceiptPayload = ConnectionRequestOptions & {
    receipt: ChannelReceipt;
    type: CHANNEL_EVENTS.CONRIM_CONNECTION;
};

export class PostMessage extends Channel {
    private _onopen: () => void;
    private _onclose: () => void;
    private _onmessage: () => void;
    private _onerror: () => void;
    private _window: Window;
    private _promises = new Map<string, (args: Channel) => void>();

    private cid: string;
    private origin: string;
    private source: Window;
    private timestamp: number;
    private identifier: string;
    private sharedKey: string;
    private publicKey: string;
    private receipt: string;

    constructor(args: ChannelArgs) {
        const { _window, spark, origin, cid, source, identifier, timestamp, sharedKey, publicKey, receipt }: ChannelArgs = args;

        super(spark);

        const allProps = !!(cid && origin && source && identifier && timestamp && sharedKey && publicKey && receipt);
        const noProps = !(cid || origin || source || identifier || timestamp || sharedKey || publicKey || receipt);
        const validChannel = (allProps && !noProps) || (!allProps && noProps);
        if (!validChannel) {
            throw new Error('Invalid args: if youre initiating provide only "spark", if recieving use the PostMessage.receive function.');
        }

        this._window = _window || window;
        this.cid = cid;
        this.origin = origin;
        this.source = source;
        this.timestamp = timestamp;
        this.identifier = identifier;
        this.sharedKey = sharedKey;
        this.publicKey = publicKey;
        this.receipt = receipt;

        this._handler = this._handler.bind(this);
        this._handleConnectionConfirmation = this._handleConnectionConfirmation.bind(this);
        this._handleError = this._handleError.bind(this);

        this._window.addEventListener('message', this._handler);
        this._window.addEventListener('beforeunload', this.close);
    }

    private async _handleConnectionConfirmation(event) {
        const { source, data, origin } = event;
        const { cid, timestamp, identifier, publicKeys, receipt }: ChannelConfirmWithReceiptPayload = data;

        const sharedKey = await this.spark.cipher.sharedKey({ publicKey: publicKeys.encryption });
        if (!sharedKey) {
            const error: ChannelErrorPayload = { error: CHANNEL_ERRORS.PUBLIC_ENCRYPTION_KEY_ERROR, message: 'invalid public encryption key' };
            return source.postMessage(error, origin);
        }

        if (!cid || !timestamp || !identifier || !publicKeys || !receipt) {
            const error: ChannelErrorPayload = { error: CHANNEL_ERRORS.CONNECT_REQUEST_OPTION_ERROR, message: 'invalid connection request options' };
            return source.postMessage(error, origin);
        }

        // check the receipt
        const openedReceipt = await this.spark.signer.verify({ signature: receipt, publicKey: publicKeys.signing });
        const decryptedReceit = await this.spark.cipher.decrypt({ data: openedReceipt, sharedKey });
        if (!openedReceipt || !decryptedReceit) {
            const error: ChannelErrorPayload = { error: CHANNEL_ERRORS.CONFIRM_CONNECTION_ERROR, message: 'error verifying receipt to confirm connection' };
            return source.postMessage(error, origin);
        }

        // good, sign and send back
        console.log('initator received valid reciept')
        const encryptedRedceipt = await this.spark.cipher.encrypt({ data: decryptedReceit, sharedKey });
        const signedReceipt = await this.spark.signer.sign({ data: encryptedRedceipt });
        const payload: ChannelConfirmWithReceiptPayload = { ...data, type: CHANNEL_EVENTS.CONRIM_CONNECTION, receipt: signedReceipt };
        console.log('initator sending back a connection receipt')
        source.postMessage(payload, origin);

        // setup connection and resolve promise
        const channelOptions: ChannelArgs = { _window: this._window, spark: this.spark, cid, timestamp, origin, source, identifier, sharedKey, publicKey: publicKeys.signing, receipt };
        const channel: Channel = new PostMessage(channelOptions);

        const promise = this._promises.get(cid);
        if (promise) {
            this._promises.delete(cid);
            return promise(channel);
        } else {
            const error = { error: CHANNEL_ERRORS.CONFIRM_CONNECTION_ERROR, message: 'error confirming connection' };
            return source.postMessage(error, origin);
        }
    }

    private _handleError(event) {
        console.log(event.data)
    }

    private _handler(event) {
        const { data, origin } = event;
        if (origin === this._window.origin) return;
        if (!data || (!data.type && !data.error)) {
            return;
        } else if (data.type === CHANNEL_EVENTS.CONRIM_CONNECTION) {
            this._handleConnectionConfirmation(event);
        } else if (data.error in CHANNEL_ERRORS) {
            this._handleError(event);
        }
    }

    async open({ url }: OpenChannelArgs) {
        if (!url) throw new Error('origin is required');
        const origin = new URL(url).origin;
        const source = this._window.open(origin, '_blank');
        if (!source) throw new Error('failed to open target window');
        this.source = source;

        const cid = randomNonce(16);
        const options: ConnectionRequestOptions = {
            cid: cid,
            timestamp: getTimestamp(),
            identifier: this.spark.controller.identifier,
            publicKeys: this.spark.controller.publicKeys,
        };

        return new Promise((resolve, reject) => {
            this._promises.set(cid, (channel) => {
                if (!channel) {
                    return reject({
                        error: CHANNEL_ERRORS.CONFIRM_CONNECTION_ERROR,
                        message: 'error confirming connection'
                    } as ChannelErrorPayload);
                }
                console.log('initator resolving their request');
                return resolve(channel);
            });
            console.log('initator opening request');
            this.source.postMessage({ type: CHANNEL_EVENTS.REQUEST_CONNECTION, ...options }, origin);
        });
    }

    onopen(callback) { this._onopen = callback; }

    async close() { }
    onclose(callback) { this._onclose = callback; }

    async message() {
    }

    onmessage(callback) { this._onmessage = callback; }

    onerror(callback) { this._onerror = callback; }
}


PostMessage.receive = function (callback, spark, thisWindow) {
    const _window = thisWindow || window;
    const promises = new Map<string, (args: ChannelReceipt) => void>();

    const handleError = (event) => {
        console.log(event)
    };

    const handleConnectionRequest = async (event) => {

        const { data, source, origin } = event;
        const { cid, timestamp, identifier, publicKeys }: ConnectionRequestOptions = data;
        const sharedKey = await spark.cipher.sharedKey({ publicKey: publicKeys.encryption });

        const details = { cid, timestamp, identifier, publicKeys };
        const reject = () => {
            const error: ChannelErrorPayload = { error: CHANNEL_ERRORS.CONNECTION_REJECTED_ERROR, message: 'connection request rejected' };
            source.postMessage(error, origin);
        }

        const resolve = async () => {
            return new Promise(async (resolve, reject) => {
                if (!sharedKey) {
                    const error: ChannelErrorPayload = { error: CHANNEL_ERRORS.PUBLIC_ENCRYPTION_KEY_ERROR, message: 'invalid public encryption key' };
                    return source.postMessage(error, origin);
                }

                if (!cid || !timestamp || !identifier || !publicKeys) {
                    const error: ChannelErrorPayload = { error: CHANNEL_ERRORS.CONNECT_REQUEST_OPTION_ERROR, message: 'invalid connection request options' };
                    return source.postMessage(error, origin);
                }

                const ourInfo = { identifier: spark.controller.identifier, publicKeys: spark.controller.publicKeys };
                const receiptData: ChannelRecieptData = { cid, timestamp, peers: [{ identifier, publicKeys }, ourInfo] };
                const ciphertext = await spark.cipher.encrypt({ data: receiptData, sharedKey });
                const receipt: ChannelReceipt = await spark.signer.sign({ data: ciphertext });

                if (!ciphertext || !receipt) {
                    const error: ChannelErrorPayload = { error: CHANNEL_ERRORS.CONFIRM_CONNECTION_ERROR, message: 'error generating receipt to confirm connection' };
                    return source.postMessage(error, origin);
                }


                promises.set(cid, async (receipt) => {
                    // check the receipt
                    const openedReceipt = await spark.signer.verify({ signature: receipt, publicKey: publicKeys.signing });
                    const decryptedReceit = await spark.cipher.decrypt({ data: openedReceipt, sharedKey });
                    if (!openedReceipt || !decryptedReceit) {
                        return reject({ error: CHANNEL_ERRORS.CONFIRM_CONNECTION_ERROR, message: 'error verifying receipt to confirm connection' });
                    }
                    console.log('receiver received valid reciept')

                    console.log('receiver resolving their request')
                    const channelOptions: ChannelArgs = { _window, spark, cid, origin, timestamp, source, identifier, sharedKey, publicKey: publicKeys.signing, receipt };
                    const channel = new PostMessage(channelOptions);
                    return resolve(channel);
                });

                const requestPayload: ConnectionRequestOptions = { cid, timestamp, ...ourInfo };
                const payload: ChannelConfirmWithReceiptPayload = { ...requestPayload, receipt, type: CHANNEL_EVENTS.CONRIM_CONNECTION };
                console.log('receiver sending back a connection receipt')
                source.postMessage({ ...payload }, origin);
            });
        };

        callback({ details, resolve, reject });
    };

    const handleConnectionConfirmation = async (event) => {
        const { data, origin } = event;
        const { cid, receipt }: ChannelConfirmWithReceiptPayload = data;
        const promise = promises.get(cid);
        if (promise) return promise(receipt);
        const error: ChannelErrorPayload = { error: CHANNEL_ERRORS.CONFIRM_CONNECTION_ERROR, message: 'error confirming connection' };
        return event.source.postMessage(error, origin);
    };

    const handler = (event) => {
        const { data, origin } = event;
        if (origin === _window.origin) return;
        if (!data || (!data.type && !data.error)) {
            return;
        } else if (data.type === CHANNEL_EVENTS.REQUEST_CONNECTION) {
            return handleConnectionRequest(event);
        } else if (data.type === CHANNEL_EVENTS.CONRIM_CONNECTION) {
            return handleConnectionConfirmation(event);
        } else if (data.error in CHANNEL_ERRORS) {
            return handleError(event);
        }
    }

    const close = () => {

    }

    _window.addEventListener('message', handler);
    _window.addEventListener('beforeunload', close);
}

