import { Cipher } from "../Cipher/Cipher";
export declare class X25519SalsaPoly extends Cipher {
    computeSharedKey({ publicKey }: {
        publicKey: any;
    }): Promise<any>;
    encrypt({ data, publicKey, sharedKey }: {
        data: any;
        publicKey: any;
        sharedKey: any;
    }): Promise<any>;
    decrypt({ data, publicKey, sharedKey }: {
        data: any;
        publicKey: any;
        sharedKey: any;
    }): Promise<any>;
}
