export type Identifier = string;
export type SigningPublicKey = string;
export type SigningSecretKey = string;
export type EncryptionPublicKey = string;
export type EncryptionSecretKey = string;
export type EncryptionSharedKey = string;
export type SigningPublicKeyHash = string;
export type EncryptionPublicKeyHash = string;
export type EncryptionKeyPair = {
    publicKey: EncryptionPublicKey;
    secretKey: EncryptionSecretKey;
};
export type SigningKeyPair = {
    publicKey: SigningPublicKey;
    secretKey: EncryptionPublicKey;
};
export type PublicKeys = {
    encryption: EncryptionPublicKey;
    signing: SigningPublicKey;
};
export type SecretKeys = {
    encryption: EncryptionSecretKey;
    signing: SigningSecretKey;
};
export type KeyPairs = {
    encryption: EncryptionKeyPair;
    signing: SigningKeyPair;
};
export type KeriEventIndex = number;
export declare enum KeriEventType {
    INCEPTION = "incept",
    ROTATION = "rotate",
    DELETION = "delete"
}
export type SigningThreshold = number;
export type SigningKeys = SigningPublicKey[];
export type NextKeyCommitments = SigningPublicKeyHash[];
export type Backer = SigningPublicKey;
export type BackerThreshold = number;
export type Backers = Backer[];
export type SelfAddressingIdentifier = string;
export type Version = string;
export type PreviousEventDigest = string;
export type KeriRotationEventArgs = {
    eventType: KeriEventType.ROTATION;
    keyPairs: KeyPairs;
    nextKeyPairs: KeyPairs;
    backers: Backers;
    previousEventDigest: PreviousEventDigest;
};
export type KeriDeletionEventArgs = {
    eventType: KeriEventType.DELETION;
    backers: Backers;
};
export type KeriInceptionEventArgs = {
    eventType: KeriEventType.INCEPTION;
    keyPairs: KeyPairs;
    nextKeyPairs: KeyPairs;
    backers: Backers;
};
export type KeriEventArgs = KeriInceptionEventArgs | KeriRotationEventArgs | KeriDeletionEventArgs;
export type KeriEvent = {
    identifier: Identifier;
    version: Version;
    eventIndex: KeriEventIndex;
    eventType: KeriEventType;
    signingThreshold: SigningThreshold;
    signingKeys: SigningKeys;
    nextKeyCommitments: NextKeyCommitments;
    backerThreshold: BackerThreshold;
    backers: Backers;
    selfAddressingIdentifier: SelfAddressingIdentifier;
};
export type KeriInceptionEvent = KeriEvent & {
    eventType: KeriEventType.INCEPTION;
};
export type KeriRotationEvent = KeriEvent & {
    previousEventDigest: string;
    eventType: KeriEventType.ROTATION;
};
export type KeriDeletionEvent = KeriRotationEvent & {
    eventType: KeriEventType.DELETION;
};
export type KeriKeyEvent = KeriInceptionEvent | KeriRotationEvent | KeriDeletionEvent;
export type KeyEventLog = KeriKeyEvent[];
export type InceptionArgs = {
    password: string;
    keyPairs: KeyPairs;
    nextKeyPairs: KeyPairs;
    backers: Backers;
};
export type RotationArgs = {
    password: string;
    newPassword: string | null;
    keyPairs: KeyPairs;
    nextKeyPairs: KeyPairs;
    backers: Backers;
};
export type DeletionArgs = {
    backers: Backers;
};
export type ImportArgs = {
    keyPairs: KeyPairs;
    data: string;
};
/**
 * Controller interface
 * responsible for managing keypairs and key event log
 * must implement methods for incepting, rotating, deleting, importing and exporting
 * relies on a cipher for encryption and decryption, a hasher for hashing and a signer
 * also provides and import and export method for backing up or restoring data
 * this is the main interface for the spark Identity
 * extend Controller class provide custom key derivation functionality
 */
export interface IController {
    /**
     * Incepts a new identity
     * @param {Object} args - The args for incepting.
     * @param {Object} args.keyPairs - Key pairs to incept with.
     * @param {Object} args.nextKeyPairs - Next key pairs to rotate to.
     * @param {Array} args.backers - List of backers to back this inception.
     * @returns {Promise<void> | never} A promise that resolves when the incept operation is complete,
     * or rejects with an error.
     */
    incept(args: InceptionArgs): Promise<void> | never;
    /**
     * Rotates the current key pairs to a new key pair
     * @param {Object} args - The args for incepting.
     * @param {Object} args.keyPairs - Key pairs to incept with.
     * @param {Object} args.nextKeyPairs - Next key pairs to rotate to.
     * @param {Array} args.backers - List of backers to back this inception.
     * @returns {Promise<void> | never} A promise that resolves when the rotate operation is complete,
     */
    rotate(args: RotationArgs): Promise<void> | never;
    /**
     * Deletes the current key pairs by rotating to a null set
     * @param {Object} args - The args for rotating.
     * @param {Array} args.backers - List of backers to back this deletion.
     * @returns {Promise<void> | never} A promise that resolves when the delete operation is complete,
     * or rejects with an error.
     */
    delete(args: DeletionArgs): Promise<void> | never;
    /**
     * Imports an identity from an encrypted serialized base64 string
     * @param {Object} args - The args for importing.
     * @param {Object} args.keyPairs - Key pairs to decrypt with.
     * @param {string} args.data - The encrypted serialized base64 string.
     * @returns {Promise<void> | never} A promise that resolves when the import operation is complete,
     * or rejects with an error.
     */
    import(args: ImportArgs): Promise<void> | never;
    /**
     * Exports an identity to an encrypted serialized base64 string
     * @returns {Promise<string> | never} A promise that resolves to the encrypted serialized base64 string.
     * or rejects with an error.
     */
    export(args?: any): Promise<any> | never;
    identifier: Identifier;
    keyEventLog: KeriKeyEvent[];
    keyPairs: KeyPairs;
    encryptionKeys: EncryptionKeyPair;
    signingKeys: SigningKeyPair;
    secretKeys: SecretKeys;
    publicKeys: PublicKeys;
}