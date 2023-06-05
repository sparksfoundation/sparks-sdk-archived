type KeyPair = {
    publicKey: string;
    secretKey: string;
};
type PublicKeys = {
    signing: string;
    encryption: string;
};
type SecretKeys = {
    signing: string;
    encryption: string;
};
type KeyPairs = {
    signing: KeyPair;
    encryption: KeyPair;
};
type PublicSigningKey = string;
type SecretSigningKey = string;
type PublicEncryptionKey = string;
type SecretEncryptionKey = string;
type RandomForge = () => KeyPairs;
type PasswordForge = (args: {
    password: string;
    identity: any;
}) => Promise<KeyPairs>;

export { KeyPair, KeyPairs, PasswordForge, PublicEncryptionKey, PublicKeys, PublicSigningKey, RandomForge, SecretEncryptionKey, SecretKeys, SecretSigningKey };
