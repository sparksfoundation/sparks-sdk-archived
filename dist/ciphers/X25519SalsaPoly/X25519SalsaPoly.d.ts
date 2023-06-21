import { Cipher } from "../Cipher/Cipher";
import { IX25519SalsaPoly } from "./types";
export declare class X25519SalsaPoly extends Cipher implements IX25519SalsaPoly {
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
