import { Spark, Blake3, Password, Ed25519, X25519SalsaPoly } from '../dist/index.mjs';
let passed

const identity = new Spark({
  controller: Password,
  signer: Ed25519,
  hasher: Blake3,
  cipher: X25519SalsaPoly,
});

await identity.controller.incept({ password: 'password' })
passed = identity.keyEventLog.length === 2 && identity.keyEventLog[1].eventType === 'incept'
console.log(`incepted:`, passed)

await identity.controller.rotate({ password: 'password' })
passed = identity.keyEventLog.length === 3 && identity.keyEventLog[2].eventType === 'rotate'
console.log(`rotated:`, passed)

await identity.controller.delete()
passed = identity.keyEventLog.length === 4 && identity.keyEventLog[3].eventType === 'delete'
console.log(`deleted:`, passed)