export type KeyPairs = {
    encryption: {
        publicKey: string;
        secretKey: string;
    };
    signing: {
        publicKey: string;
        secretKey: string;
    };
};

export type ComputeSharedKey = ({ publicKey }: { publicKey: string }) => string;

export interface Channel {
    cid: string;
    publicKey: string;
    sharedKey: string;
    close: (args: any) => void;
    send: (args: any) => void;
    onMessage: (args: any) => void;
    onOpen: (args: any) => void;
    onClose: (args: any) => void;
}

export interface ChannelManager {
    channels: Channel[];
    open: (options: { target?: Window, onOpen: Function, onClose: Function, beforeOpen: Function, [key: string]: any }) => void;
    close: (args: any) => void;
}