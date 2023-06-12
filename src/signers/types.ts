/**
 * Signer interface
 * responsible for signing and verifying data
 * can sign messages detached or attached
 * can open detached signatures OR verify attached signatures
 * extend Signer class to implement other signing algorithms
 */
export interface ISigner {
  /**
   * Signs data using ed25519
   * @param {object|string} data - data to sign (object will be stringified)
   * @param {boolean} detached - whether to return detached signature
   * @returns {Promise<string>} - resolved with base64 encoded signature,
   * or rejected with an error.
   */
  sign: ({ data, detached }: { data: object | string; detached?: boolean }) => Promise<string> | never;

  /**
   * Verifies data using ed25519
   * @param {string} publicKey - base64 encoded public key
   * @param {string} signature - base64 encoded signature
   * @param {object|string} data - string or object to verify, if provided verifies detached signature
   * @returns {Promise<boolean|string|object|null>} - resolve with boolen result if data is provided, otherwise returns parsed data, string or null,
   * or rejected with an error.
   */
  verify: ({ publicKey, signature, data }: { publicKey: string, signature: string, data?: object | string }) => Promise<boolean> | Promise<string | object | null> | never;
}