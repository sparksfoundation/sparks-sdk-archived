import { HashDigest } from "../hashers/types";
import { SigningPublicKey } from "../signers/types";
import { ErrorInterface } from "../common/errors";
import { KeyPairs } from "../types";

export enum ControllerErrorType {
  INVALID_IDENTIFIER = 'INVALID_IDENTIFIER',
  INVALID_KEY_EVENT_LOG = 'INVALID_KEY_EVENT_LOG',
}

export type Identifier = string;

// primitives
export type SigningThreshold = number;                    // kt: minimum amount of signatures needed for this event to be valid (multisig)
export type SequenceIndex = number;                       // s: sequence number
export type SigningKeys = SigningPublicKey[];             // k: list of signing key
export type NextKeyCommitments = HashDigest[];            // n: next keys
export type Backer = SigningPublicKey;                    // b: individual backer
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
export type KeyEvent = KeyInceptionEvent | KeyRotationEvent | KeyDestructionEvent;

// collections
export interface KeyEventLog extends Array<KeyEvent> { }

// main controller interface
export interface ControllerInterface {
  getIdentifier(): Identifier | ErrorInterface;
  getKeyEventLog(): KeyEventLog | ErrorInterface;
  incept({ keyPairs, nextKeyPairs, backers }: { keyPairs: KeyPairs, nextKeyPairs: KeyPairs, backers: Backer[] }): Promise<void | ErrorInterface>;
  rotate({ keyPairs, nextKeyPairs, backers }: { keyPairs: KeyPairs, nextKeyPairs: KeyPairs, backers: Backer[] }): Promise<void | ErrorInterface>;
  destroy({ keyPairs, nextKeyPairs, backers }: { keyPairs: KeyPairs, nextKeyPairs: KeyPairs, backers: Backer[] }): Promise<void | ErrorInterface>;
}
