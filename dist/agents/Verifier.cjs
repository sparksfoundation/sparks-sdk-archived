'use strict';

var Identity_js = require('./Identity.js');

class Verifier extends Identity_js.Identity {
  constructor() {
    super();
  }
  // helper to create a normalized requestUri
  requestUri() {
  }
  // helper to check the validity of a requestUri's response
  verifyRequest() {
  }
}

exports.Verifier = Verifier;
