'use strict';

var blake3 = require('@noble/hashes/blake3');
var util = require('tweetnacl-util');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var util__default = /*#__PURE__*/_interopDefault(util);

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
    return util__default.default.encodeBase64(blake3.blake3(stringData));
  }
};

module.exports = Blake3_default;
