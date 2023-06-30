import { CoreAgent } from "./agents/CoreAgent";
import { CoreCipher } from "./ciphers/CoreCipher";
import { CipherKeyPair, CipherPublicKey, CipherSecretKey } from "./ciphers/types";
import { CoreController } from "./controllers";
import { CoreHasher } from "./hashers/CoreHasher";
import { CoreSigner } from "./signers/CoreSigner";
import { SignedEncryptedData, SignerKeyPair, SignerPublicKey, SignerSecretKey } from "./signers/types";

// spark
export interface KeyPairs {
  cipher: CipherKeyPair;
  signer: SignerKeyPair;
}

export interface PublicKeys {
  cipher: CipherPublicKey;
  signer: SignerPublicKey;
}

export interface SecretKeys {
  cipher: CipherSecretKey;
  signer: SignerSecretKey;
}

export type ExtractReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

export interface SparkInterface<
  A extends CoreAgent[],
  X extends CoreCipher,
  C extends CoreController,
  H extends CoreHasher,
  S extends CoreSigner,
> {

  // cores can be accessed for advanced functionality
  agents: { [key: string]: A[number] };
  cipher: X;
  controller: C;
  hasher: H;
  signer: S;

  // helpers to get keys
  identifier: ReturnType<C['getIdentifier']>;
  
  publicKeys: {
    cipher: ReturnType<X['getPublicKey']>,
    signer: ReturnType<S['getPublicKey']>,
  };

  secretKeys: {
    cipher: ReturnType<X['getSecretKey']>,
    signer: ReturnType<S['getSecretKey']>,
  };

  keyPairs: {
    signer: ReturnType<S['getKeyPair']>,
    cipher: ReturnType<X['getKeyPair']>,
  };

  incept(params: {
    cipher: Parameters<X['generateKeyPair']>[0],
    signer: Parameters<S['generateKeyPair']>[0],
  } & Parameters<C['incept']>[0]): Promise<void>;

  incept(params:
    Parameters<X['generateKeyPair']>[0] &
    Parameters<S['generateKeyPair']>[0] &
    Parameters<C['incept']>[0]
  ): Promise<void>;

  rotate(params: {
    cipher: Parameters<X['generateKeyPair']>[0],
    signer: Parameters<S['generateKeyPair']>[0],
  } & Parameters<C['rotate']>[0]): Promise<void>;

  rotate(params:
    Parameters<X['generateKeyPair']>[0] &
    Parameters<S['generateKeyPair']>[0] &
    Parameters<C['rotate']>[0]
  ): Promise<void>;

  destroy(params?:
    Parameters<C['destroy']>[0]
  ): Promise<void>;

  // cipher facade
  encrypt: X['encrypt'];
  decrypt: X['decrypt'];

  // hasher facade
  hash: H['hash'];

  // signer facade
  sign: S['sign'];
  seal: S['seal'];
  verify: S['verify'];
  open: S['open'];

  // imports exports evertything
  import: (data: SignedEncryptedData) => Promise<void>;
  export: () => Promise<SignedEncryptedData>;

  // controller facade, uses cipher and signer to automate key generation
  keyEventLog: C['getKeyEventLog'];
}