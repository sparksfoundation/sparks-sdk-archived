/**
 * Hasher interface
 * responsible for hashing data
 * extend Hasher class to implement other hashing algorithms
 */
export interface IHasher {
    /**
     * Hashes object or string
     * @param {string} data - data to hash (object will be stringified)
     * @returns {Promise<string> | never} A promise that resolves to the base64 encoded string.
     * or rejects with an error.
     */
    hash: (data: any) => Promise<string> | never;
}
