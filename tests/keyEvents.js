import { Spark } from '../dist/index.mjs';
import { Blake3 } from '../dist/hashers/index.mjs';
import { Ed25519 } from '../dist/signers/index.mjs';
import { X25519SalsaPoly } from '../dist/ciphers/index.mjs';
import { Password } from '../dist/controllers/index.mjs';

let passed
const identity = new Spark({
  controller: Password,
  signer: Ed25519,
  hasher: Blake3,
  cipher: X25519SalsaPoly,
});

await identity.controller.incept({ password: 'password' })
passed = identity.keyEventLog.length === 2 && identity.keyEventLog[0].eventType === 'incept'
console.log(`incepted:`, passed)

await identity.controller.rotate({ password: 'password' })
passed = identity.keyEventLog.length === 3 && identity.keyEventLog[2].eventType === 'rotate'
console.log(`rotated:`, passed)

await identity.controller.delete()
passed = identity.keyEventLog.length === 4 && identity.keyEventLog[3].eventType === 'delete'
console.log(`deleted:`, passed)