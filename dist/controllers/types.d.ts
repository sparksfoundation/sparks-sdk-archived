import { HashDigest } from "../hashers/types";
import { SignerPublicKey } from "../signers/types";
export declare enum ControllerType {
    CORE_CONTROLLER = "CORE_CONTROLLER",
    BASIC_CONTROLLER = "BASIC_CONTROLLER"
}
export type Identifier = string;
export type SigningThreshold = number;
export type SequenceIndex = number;
export type SigningKeys = SignerPublicKey[];
export type NextKeyCommitments = HashDigest[];
export type Backer = SignerPublicKey;
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
    index: SequenceIndex;
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
    index: SequenceIndex;
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
    index: SequenceIndex;
    signingThreshold: SigningThreshold;
    signingKeys: SigningKeys;
    nextKeyCommitments: NextKeyCommitments;
    backerThreshold: BackerThreshold;
    backers: Backer[];
    selfAddressingIdentifier: SelfAddressingIdentifier;
    previousEventDigest: PreviousEventDigest;
}
export type AnyKeyEvent = KeyInceptionEvent | KeyRotationEvent | KeyDestructionEvent;
export type BaseKeyEventProps = Omit<AnyKeyEvent, 'type' | 'identifier' | 'version' | 'selfAddressingIdentifier'>;
export type KeyEventMap = {
    [KeyEventType.INCEPT]: KeyInceptionEvent;
    [KeyEventType.ROTATE]: KeyRotationEvent;
    [KeyEventType.DESTROY]: KeyDestructionEvent;
};
export type KeyEventLog = AnyKeyEvent[];
