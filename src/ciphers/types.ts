export type SharedEncryptionKey = string;

/**
 * Cipher interface
 * responsible for symmetric and asymmetric encrypting & decrypting operations.
 * must also implement a method for computing a shared key.
 * relies on controller's keyPairs and inbound public keys.
 * extend Cipher class to provide other cipher algorithms.
 */
export interface ICipher {
  /**
   * Encrypts data using X25519SalsaPoly
   * @param {object|string} data
   * @param {string} publicKey
   * @param {string} sharedKey
   * @returns {string}
   */
  encrypt: (args: { data: object | string; publicKey?: string; sharedKey?: string; }) => Promise<string> | never;

  /**
   * Decrypts data using X25519SalsaPoly
   * @param {string} data
   * @param {string} publicKey
   * @param {string} sharedKey
   * @returns {string}
   */
  decrypt: (args: { data: string; publicKey?: string; sharedKey?: string; }) => Promise<string> | never;

  /**
   * Computes a shared key using X25519SalsaPoly
   * @param {string} publicKey 
   * @returns {string} sharedKey
   */
  shareKey: (args: { publicKey: string; }) => Promise<string> | never;
}