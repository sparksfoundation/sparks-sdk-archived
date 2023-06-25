import { HashDigest } from "./Hasher";
import { SigningPublicKey } from "./Signer";
import { ErrorInterface } from "./Error";
export type Identifier = string;
export type SigningThreshold = number;
export type EventIndex = number;
export type SigningKeys = SigningPublicKey[];
export type NextKeyCommitments = HashDigest[];
export type Backer = SigningPublicKey;
export type BackerThreshold = number;
export type SelfAddressingIdentifier = HashDigest;
export type Version = string;
export type PreviousEventDigest = HashDigest;
export declare enum KeyEventType {
    INCEPT = "INCEPT",
    ROTATE = "ROTATE",
    DESTROY = "DESTROY"
}
export interface KeyInceptionEvent {
    type: KeyEventType.INCEPT;
    identifier: Identifier;
    version: Version;
    index: EventIndex;
    signingThreshold: SigningThreshold;
    signingKeys: SigningKeys;
    nextKeyCommitments: NextKeyCommitments;
    backerThreshold: BackerThreshold;
    backers: Backer[];
    selfAddressingIdentifier: SelfAddressingIdentifier;
}
export interface KeyRotationEvent {
    type: KeyEventType.ROTATE;
    identifier: Identifier;
    version: Version;
    index: EventIndex;
    signingThreshold: SigningThreshold;
    signingKeys: SigningKeys;
    nextKeyCommitments: NextKeyCommitments;
    backerThreshold: BackerThreshold;
    backers: Backer[];
    selfAddressingIdentifier: SelfAddressingIdentifier;
    previousEventDigest: PreviousEventDigest;
}
export interface KeyDestructionEvent {
    type: KeyEventType.DESTROY;
    identifier: Identifier;
    version: Version;
    index: EventIndex;
    signingThreshold: SigningThreshold;
    signingKeys: SigningKeys;
    nextKeyCommitments: NextKeyCommitments;
    backerThreshold: BackerThreshold;
    backers: Backer[];
    selfAddressingIdentifier: SelfAddressingIdentifier;
    previousEventDigest: PreviousEventDigest;
}
export type KeyEvent = KeyInceptionEvent | KeyRotationEvent | KeyDestructionEvent;
export interface KeyEventLog extends Array<KeyEvent> {
}
export interface ControllerInterface {
    identifier: Identifier | ErrorInterface;
    keyEventLog: KeyEventLog | ErrorInterface;
    incept(...args: any): Promise<KeyInceptionEvent | ErrorInterface>;
    rotate(...args: any): Promise<KeyRotationEvent | ErrorInterface>;
    destroy(...args: any): Promise<KeyDestructionEvent | ErrorInterface>;
}
