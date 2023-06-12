
export interface ISigner {
  /**
   * Signs data using ed25519
   * @param {object|string} data
   * @param {boolean} detached
   * @returns {string}
   */
  sign: ({ data, detached }: { data: object | string; detached?: boolean }) => Promise<string> | never;

  /**
   * Verifies data using ed25519
   * @param {string} publicKey
   * @param {string} signature
   * @param {object|string} data
   * @returns {boolean|object|string}
   */
  verify: ({ publicKey, signature, data }: { publicKey: string, signature: string, data: object | string }) => Promise<boolean> | Promise<string> | never;
}