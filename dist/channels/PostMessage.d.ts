declare class PostMessageChannel {
    #private;
    target: Window;
    origin: string;
    publicKeys: any;
    constructor({ keyPairs, encrypt, decrypt, sign, verify, computeSharedKey }: {
        keyPairs: any;
        encrypt: any;
        decrypt: any;
        sign: any;
        verify: any;
        computeSharedKey: any;
    });
    accept({ url }: {
        url: any;
    }): Promise<unknown>;
    connect({ url }: {
        url: any;
    }): Promise<unknown>;
    disconnect(): Promise<unknown>;
    send(data: any): Promise<unknown>;
    on(eventType: any, callback: any): void;
}
declare const _default: (Base: any) => {
    new (...args: any[]): {
        [x: string]: any;
        postMessage(): PostMessageChannel;
    };
    [x: string]: any;
};

export { _default as default };
