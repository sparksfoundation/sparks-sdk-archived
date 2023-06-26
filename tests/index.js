import signer from './signer.js';
import cipher from './cipher.js';
import controller from './controller.js'

(async function() {
  await signer();
  await cipher();
  await controller();
}())