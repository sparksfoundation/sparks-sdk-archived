
export interface IHasher {
  /**
   * Hashes object or string 
   * @param {string} data 
   * @returns {string}
   */
  hash: (data: any) => Promise<string> | never;
}
