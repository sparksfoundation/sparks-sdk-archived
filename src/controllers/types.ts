import { HashDigest } from "../hashers/types";
import { SignerPublicKey } from "../signers/types";
import { CombinedInterface } from "../utilities/types";

export enum ControllerType {
  CONTROLLER_CORE = 'CONTROLLER_CORE',
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
export type KeyEvent = KeyInceptionEvent | KeyRotationEvent | KeyDestructionEvent;

// intersect
export type CommonKeyEventProps = CombinedInterface<[KeyInceptionEvent, KeyRotationEvent, KeyDestructionEvent]>

// base is anything common that doesn't need to be computed
export type BaseKeyEventProps = Omit<CommonKeyEventProps, 'type' | 'identifier' | 'version' | 'selfAddressingIdentifier'>;

export type KeyEventMap = {
  [KeyEventType.INCEPT]: KeyInceptionEvent;
  [KeyEventType.ROTATE]: KeyRotationEvent;
  [KeyEventType.DESTROY]: KeyDestructionEvent;
}

// collections
export type KeyEventLog = KeyEvent[]
