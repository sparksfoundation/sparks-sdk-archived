import { Signer } from "../Signer";
export declare class Ed25519 extends Signer {
    sign({ data, detached }: {
        data: any;
        detached?: boolean | undefined;
    }): Promise<any>;
    verify({ publicKey, signature, data }: {
        publicKey: any;
        signature: any;
        data: any;
    }): Promise<any>;
}
