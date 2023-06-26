import * as scrypt from 'scrypt-pbkdf';
import { ErrorInterface } from "../../common/errors";
import { SigatureDetached, Signature, SignatureData, SignatureVerified, SigningKeyPair } from "../types";
import { Ed25519 } from "./Ed25519";
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import { SignerAbstract } from '../SignerCore';

export class Ed25519Password extends SignerAbstract {
    private Ed25519: Ed25519;
    constructor() {
        super();
        this.Ed25519 = new Ed25519();
    }

    public async generateKeyPair({ password, salt: nonce }: { password: string, salt?: string }): Promise<SigningKeyPair | ErrorInterface> {
        const options = { N: 16384, r: 8, p: 1 };
        const salt = nonce || util.encodeBase64(nacl.randomBytes(16));
        const len = nacl.box.secretKeyLength / 2;
        const buffer = await scrypt.scrypt(password, salt, len, options);
        
        const seed = [...new Uint8Array(buffer)]
            .map((x) => x.toString(16).padStart(2, '0'))
            .join('');

        const uint8Seed = util.decodeUTF8(seed);
        const keyPair = nacl.sign.keyPair.fromSeed(uint8Seed);
        const secretKey = util.encodeBase64(keyPair.secretKey);
        return { publicKey: util.encodeBase64(keyPair.publicKey), secretKey, salt } as SigningKeyPair & { salt: string };
    }

    public async sign(args: Parameters<Ed25519['verify']>[0]): Promise<SigatureDetached | ErrorInterface> {
        return this.Ed25519.sign(args);
    }

    public async verify(args: Parameters<Ed25519['verify']>[0]): Promise<SignatureVerified | ErrorInterface> {
        return this.Ed25519.verify(args);
    }

    public async seal(args: Parameters<Ed25519['seal']>[0]): Promise<Signature | ErrorInterface> {
        return this.Ed25519.seal(args);
    }

    public async open(args: Parameters<Ed25519['open']>[0]): Promise<SignatureData | ErrorInterface> {
        return this.Ed25519.open(args);
    }
}