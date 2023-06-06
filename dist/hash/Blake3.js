import { blake3 } from '@noble/hashes/blake3';
import util from 'tweetnacl-util';

var Blake3_default = (Base, symbols) => class Blake3 extends Base {
  constructor(...args) {
    super(...args);
  }
  /**
   * Hashes data using blake3
   * @param {string} data 
   * @returns {string}
   */
  hash(data) {
    const stringData = typeof data !== "string" ? JSON.stringify(data) : data;
    return util.encodeBase64(blake3(stringData));
  }
};

export { Blake3_default as default };
