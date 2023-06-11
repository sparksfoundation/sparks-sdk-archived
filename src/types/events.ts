import { Identifier } from "./controller.js";
import { KeyPairs, SigningPublicKey, SingingPublicKeyHash } from "./keys.js";

export type EventIndex = number;                                      // s: sequence number      
export enum EventType {                                               // t: event type
  INCEPTION = 'inception',
  ROTATION = 'rotation',
  DELETION = 'deletion',
}
export type SigningThreshold = number;                                // kt: minimum amount of signatures needed for this event to be valid (multisig)
export type SigningKeys = SigningPublicKey[];                    // k: list of signing key
export type NextKeyCommitments = SingingPublicKeyHash[];         // n: next keys
export type Backer = SigningPublicKey;                                // b: individual backer
export type BackerThreshold = number;                                 // bt: minimum amount of backers threshold 
export type Backers = Backer[];                                  // b: list of backers in this case the spark pwa-agent host's publickey there's no receipt at this ste
export type SelfAddressingIdentifier = string;                        // d: self-addressing identifier
export type Version = string;                                         // v: version
export type PreviousEventDigest = string;                             // p: previous event digest

export type KeriRotationEventOptions = {
  eventType: EventType.ROTATION;
  keyPairs: KeyPairs;
  nextKeyPairs: KeyPairs;
  backers: Backers;
  previousEventDigest: PreviousEventDigest;
}

export type KeriDeletionEventOptions = {
  eventType: EventType.DELETION;
  backers: Backers;
}

export type KeriInceptionEventOptions = {
  eventType: EventType.INCEPTION;
  keyPairs: KeyPairs;
  nextKeyPairs: KeyPairs;
  backers: Backers;
}

export type KeriEventOptions = KeriInceptionEventOptions | KeriRotationEventOptions | KeriDeletionEventOptions;

export type KeriEvent = {
  identifier: Identifier;
  version: Version;
  eventIndex: EventIndex;
  eventType: EventType;
  signingThreshold: SigningThreshold;
  signingKeys: SigningKeys;
  nextKeyCommitments: NextKeyCommitments;
  backerThreshold: BackerThreshold;
  backers: Backers;
  selfAddressingIdentifier: SelfAddressingIdentifier;
}

export type KeriInceptionEvent = KeriEvent & {
  eventType: EventType.INCEPTION;
}

export type KeriRotationEvent = KeriEvent & {
  previousEventDigest: string;
  eventType: EventType.ROTATION;
}

export type KeriEvents = KeriInceptionEvent | KeriRotationEvent;