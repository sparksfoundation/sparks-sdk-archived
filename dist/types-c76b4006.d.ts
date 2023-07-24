import { S as SparkAgentInterface } from './types-d473a34c.js';
import { C as CipherKeyPair, S as SparkCipherInterface } from './types-188a9fde.js';
import { H as HashDigest, S as SparkHasherInterface } from './types-40269ceb.js';
import { e as SignerPublicKey, S as SignerKeyPair, f as SparkSignerInterface } from './types-14ae8009.js';

type Identifier = string;
type SigningThreshold = number;
type SequenceIndex = number;
type SigningKeys = SignerPublicKey[];
type NextKeyCommitments = HashDigest[];
type Backer = SignerPublicKey;
type BackerThreshold = number;
type SelfAddressingIdentifier = HashDigest;
type Version = string;
type PreviousEventDigest = HashDigest;
declare enum KeyEventType {
    INCEPT = "INCEPT",
    ROTATE = "ROTATE",
    DESTROY = "DESTROY"
}
interface KeyInceptionEvent {
    type: KeyEventType.INCEPT;
    identifier: Identifier;
    version: Version;
    index: SequenceIndex;
    signingThreshold: SigningThreshold;
    signingKeys: SigningKeys;
    nextKeyCommitments: NextKeyCommitments;
    backerThreshold: BackerThreshold;
    backers: Backer[];
    selfAddressingIdentifier: SelfAddressingIdentifier;
}
interface KeyRotationEvent {
    type: KeyEventType.ROTATE;
    identifier: Identifier;
    version: Version;
    index: SequenceIndex;
    signingThreshold: SigningThreshold;
    signingKeys: SigningKeys;
    nextKeyCommitments: NextKeyCommitments;
    backerThreshold: BackerThreshold;
    backers: Backer[];
    selfAddressingIdentifier: SelfAddressingIdentifier;
    previousEventDigest: PreviousEventDigest;
}
interface KeyDestructionEvent {
    type: KeyEventType.DESTROY;
    identifier: Identifier;
    version: Version;
    index: SequenceIndex;
    signingThreshold: SigningThreshold;
    signingKeys: SigningKeys;
    nextKeyCommitments: NextKeyCommitments;
    backerThreshold: BackerThreshold;
    backers: Backer[];
    selfAddressingIdentifier: SelfAddressingIdentifier;
    previousEventDigest: PreviousEventDigest;
}
type AnyKeyEvent = KeyInceptionEvent | KeyRotationEvent | KeyDestructionEvent;
type KeyEventLog = AnyKeyEvent[];
interface SparkControllerInterface {
    readonly identifier: Identifier;
    readonly keyEventLog: KeyEventLog;
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
    incept(params?: Record<string, any>): Promise<void>;
    rotate(params?: Record<string, any>): Promise<void>;
    destroy(params?: Record<string, any>): Promise<void>;
}

type SignedEncryptedData = string;
type KeyPairs = {
    signer: SignerKeyPair;
    cipher: CipherKeyPair;
};
type PublicKeys = {
    signer: SignerKeyPair['publicKey'];
    cipher: CipherKeyPair['publicKey'];
};
interface SparkInterface<Agents extends SparkAgentInterface[], Cipher extends SparkCipherInterface, Controller extends SparkControllerInterface, Hasher extends SparkHasherInterface, Signer extends SparkSignerInterface> {
    readonly agents: {
        [key: string]: Agents[number];
    };
    readonly cipher: Cipher;
    readonly controller: Controller;
    readonly hasher: Hasher;
    readonly signer: Signer;
    identifier: Controller['identifier'];
    publicKeys: {
        cipher: Cipher['publicKey'];
        signer: Signer['publicKey'];
    };
    secretKeys: {
        cipher: Cipher['secretKey'];
        signer: Signer['secretKey'];
    };
    keyPairs: {
        cipher: Cipher['keyPair'];
        signer: Signer['keyPair'];
    };
    keyEventLog: Controller['keyEventLog'];
    incept(params: Parameters<Cipher['generateKeyPair']>[0] & Parameters<Signer['generateKeyPair']>[0] & Parameters<Controller['incept']>[0]): Promise<void>;
    incept(params: {
        cipher: Parameters<Cipher['generateKeyPair']>[0];
        signer: Parameters<Signer['generateKeyPair']>[0];
    } & Parameters<Controller['incept']>[0]): Promise<void>;
    incept(params?: Parameters<Controller['incept']>[0]): Promise<void>;
    rotate(params: {
        cipher: Parameters<Cipher['generateKeyPair']>[0];
        signer: Parameters<Signer['generateKeyPair']>[0];
    } & Parameters<Controller['rotate']>[0]): Promise<void>;
    rotate(params: Parameters<Cipher['generateKeyPair']>[0] & Parameters<Signer['generateKeyPair']>[0] & Parameters<Controller['rotate']>[0]): Promise<void>;
    destroy(params?: Parameters<Controller['destroy']>[0]): Promise<void>;
    encrypt: Cipher['encrypt'];
    decrypt: Cipher['decrypt'];
    hash: Hasher['hash'];
    sign: Signer['sign'];
    seal: Signer['seal'];
    verify: Signer['verify'];
    open: Signer['open'];
    import(params: Parameters<Cipher['generateKeyPair']>[0] & Parameters<Signer['generateKeyPair']>[0] & {
        data: SignedEncryptedData;
    }): Promise<void>;
    import(params: {
        cipher: Parameters<Cipher['generateKeyPair']>[0];
        signer: Parameters<Signer['generateKeyPair']>[0];
        data: SignedEncryptedData;
    }): Promise<void>;
    export: () => Promise<SignedEncryptedData>;
}

export { Identifier as I, KeyEventLog as K, PublicKeys as P, SparkControllerInterface as S, SparkInterface as a, KeyPairs as b, SignedEncryptedData as c };
