export type SharedEncryptionKey = string;

export interface Cipher {
  constructor: (spark: any) => void; // TODO define spark interface

  /**
   * Encrypts data using X25519SalsaPoly
   * @param {object|string} data
   * @param {string} publicKey
   * @param {string} sharedKey
   * @returns {string}
   */
  encrypt: (data: string) => Promise<string>;

  /**
   * Decrypts data using X25519SalsaPoly
   * @param {string} data
   * @param {string} publicKey
   * @param {string} sharedKey
   * @returns {string}
   */
  decrypt: (data: string) => Promise<string>;

  /**
   * Computes a shared key using X25519SalsaPoly
   * @param {string} publicKey 
   * @returns {string} sharedKey
   */
  shareKey: (publicKey: string) => Promise<string>;
}