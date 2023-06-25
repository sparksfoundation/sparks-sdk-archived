import signer from './signer.js';
import cipher from './cipher.js';

(async function() {
  await signer();
  await cipher();
}())