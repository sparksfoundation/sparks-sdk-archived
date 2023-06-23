import { ACipher } from "../Cipher/types";
import { IX25519SalsaPoly } from "./types";
export declare class X25519SalsaPoly extends ACipher implements IX25519SalsaPoly {
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
