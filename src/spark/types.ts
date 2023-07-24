import { SparkAgentInterface } from "../agents/SparkAgent/types";
import { CipherKeyPair, SparkCipherInterface } from "../ciphers/SparkCipher/types";
import { SparkControllerInterface } from "../controllers/SparkController/types";
import { SparkHasherInterface } from "../hashers/SparkHasher/types";
import { SignerKeyPair, SparkSignerInterface } from "../signers/SparkSigner/types";

export type SignedEncryptedData = string;

export type KeyPairs = {
  signer: SignerKeyPair,
  cipher: CipherKeyPair
}

export type PublicKeys = {
  signer: SignerKeyPair['publicKey'],
  cipher: CipherKeyPair['publicKey'],
}

export interface SparkInterface<
  Agents extends SparkAgentInterface[],
  Cipher extends SparkCipherInterface,
  Controller extends SparkControllerInterface,
  Hasher extends SparkHasherInterface,
  Signer extends SparkSignerInterface,
> {

  readonly agents: { [key: string]: Agents[number] };
  readonly cipher: Cipher;
  readonly controller: Controller;
  readonly hasher: Hasher;
  readonly signer: Signer;

  // helpers to get keys
  identifier: Controller['identifier'];

  publicKeys: {
    cipher: Cipher['publicKey'],
    signer: Signer['publicKey'],
  };

  secretKeys: {
    cipher: Cipher['secretKey'],
    signer: Signer['secretKey'],
  };

  keyPairs: {
    cipher: Cipher['keyPair'],
    signer: Signer['keyPair'],
  };

  keyEventLog: Controller['keyEventLog'];

  incept(params:
    Parameters<Cipher['generateKeyPair']>[0] &
    Parameters<Signer['generateKeyPair']>[0] &
    Parameters<Controller['incept']>[0]
  ): Promise<void>;

  incept(params: {
    cipher: Parameters<Cipher['generateKeyPair']>[0],
    signer: Parameters<Signer['generateKeyPair']>[0],
  } & Parameters<Controller['incept']>[0]): Promise<void>;

  incept(params?: Parameters<Controller['incept']>[0]): Promise<void>;

  rotate(params: {
    cipher: Parameters<Cipher['generateKeyPair']>[0],
    signer: Parameters<Signer['generateKeyPair']>[0],
  } & Parameters<Controller['rotate']>[0]): Promise<void>;

  rotate(params:
    Parameters<Cipher['generateKeyPair']>[0] &
    Parameters<Signer['generateKeyPair']>[0] &
    Parameters<Controller['rotate']>[0]
  ): Promise<void>;

  destroy(params?:
    Parameters<Controller['destroy']>[0]
  ): Promise<void>;

  // cipher facade
  encrypt: Cipher['encrypt'];
  decrypt: Cipher['decrypt'];

  // hasher facade
  hash: Hasher['hash'];

  // signer facade
  sign: Signer['sign'];
  seal: Signer['seal'];
  verify: Signer['verify'];
  open: Signer['open'];

  // imports exports evertything
  import(params:
    Parameters<Cipher['generateKeyPair']>[0] &
    Parameters<Signer['generateKeyPair']>[0] &
    { data: SignedEncryptedData }
  ): Promise<void>;

  import(params: {
    cipher: Parameters<Cipher['generateKeyPair']>[0],
    signer: Parameters<Signer['generateKeyPair']>[0],
    data: SignedEncryptedData,
  }): Promise<void>;

  export: () => Promise<SignedEncryptedData>;
}
