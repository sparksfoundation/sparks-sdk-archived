import { HashDigest } from "../../hashers/SparkHasher/types";
import { SignerPublicKey } from "../../signers/SparkSigner/types";

export enum ControllerType {
  CORE_CONTROLLER = 'CORE_CONTROLLER',
  BASIC_CONTROLLER = 'BASIC_CONTROLLER',
}

export type Identifier = string;

// primitives
export type SigningThreshold = number;                    // kt: minimum amount of signatures needed for this event to be valid (multisig)
export type SequenceIndex = number;                       // s: sequence number
export type SigningKeys = SignerPublicKey[];             // k: list of signing key
export type NextKeyCommitments = HashDigest[];            // n: next keys
export type Backer = SignerPublicKey;                    // b: individual backer
export type BackerThreshold = number;                     // bt: minimum amount of backers threshold
export type SelfAddressingIdentifier = HashDigest;        // d: self-addressing identifier
export type Version = string;                             // v: version
export type PreviousEventDigest = HashDigest;             // p: previous event digest

// enums
export enum KeyEventType {
  INCEPT = 'INCEPT',
  ROTATE = 'ROTATE',
  DESTROY = 'DESTROY',
}

// events
export interface KeyInceptionEvent {
  type: KeyEventType.INCEPT;                                // t: event type
  identifier: Identifier;                                   // s: sequence number
  version: Version;                                         // v: version
  index: SequenceIndex;                                     // i: inception event index
  signingThreshold: SigningThreshold;                       // kt: minimum amount of signatures needed for this event to be valid (multisig)
  signingKeys: SigningKeys;                                 // k: list of signing key
  nextKeyCommitments: NextKeyCommitments;                   // n: next keys
  backerThreshold: BackerThreshold;                         // bt: minimum amount of backers threshold
  backers: Backer[];                                        // b: list of backers in this case the spark pwa-agent host's publickey there's no receipt at this ste
  selfAddressingIdentifier: SelfAddressingIdentifier;       // d: self-addressing identifier
}

export interface KeyRotationEvent {
  type: KeyEventType.ROTATE;                                // t: event type
  identifier: Identifier;                                   // s: sequence number
  version: Version;                                         // v: version
  index: SequenceIndex;                                        // i: inception event index
  signingThreshold: SigningThreshold;                       // kt: minimum amount of signatures needed for this event to be valid (multisig)
  signingKeys: SigningKeys;                                 // k: list of signing key
  nextKeyCommitments: NextKeyCommitments;                   // n: next keys
  backerThreshold: BackerThreshold;                         // bt: minimum amount of backers threshold
  backers: Backer[];                                        // b: list of backers in this case the spark pwa-agent host's publickey there's no receipt at this ste
  selfAddressingIdentifier: SelfAddressingIdentifier;       // d: self-addressing identifier
  previousEventDigest: PreviousEventDigest;                 // p: previous event digest
}

export interface KeyDestructionEvent {
  type: KeyEventType.DESTROY;                               // t: event type
  identifier: Identifier;                                   // s: sequence number
  version: Version;                                         // v: version
  index: SequenceIndex;                                        // i: inception event index
  signingThreshold: SigningThreshold;                       // kt: minimum amount of signatures needed for this event to be valid (multisig)
  signingKeys: SigningKeys;                                 // k: list of signing key
  nextKeyCommitments: NextKeyCommitments;                   // n: next keys
  backerThreshold: BackerThreshold;                         // bt: minimum amount of backers threshold
  backers: Backer[];                                        // b: list of backers in this case the spark pwa-agent host's publickey there's no receipt at this ste
  selfAddressingIdentifier: SelfAddressingIdentifier;       // d: self-addressing identifier
  previousEventDigest: PreviousEventDigest;                 // p: previous event digest
}

// unions
export type AnyKeyEvent = KeyInceptionEvent | KeyRotationEvent | KeyDestructionEvent;

// base is anything common that doesn't need to be computed
export type BaseKeyEventProps = Omit<AnyKeyEvent, 'type' | 'identifier' | 'version' | 'selfAddressingIdentifier'>;

export type KeyEventMap = {
  [KeyEventType.INCEPT]: KeyInceptionEvent;
  [KeyEventType.ROTATE]: KeyRotationEvent;
  [KeyEventType.DESTROY]: KeyDestructionEvent;
}

// collections
export type KeyEventLog = AnyKeyEvent[]

export interface SparkControllerInterface {
  readonly identifier: Identifier;
  readonly keyEventLog: KeyEventLog;

  import(data: Record<string, any>): Promise<void>;
  export(): Promise<Record<string, any>>;

  incept(params?: Record<string, any>): Promise<void>;
  rotate(params?: Record<string, any>): Promise<void>;
  destroy(params?: Record<string, any>): Promise<void>;
}