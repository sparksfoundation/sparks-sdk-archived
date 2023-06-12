import { Spark, Blake3, Password, Ed25519, X25519SalsaPoly, User, Verifier } from '../dist/index.js';
let passed

const identity = new Spark({
  agents: [ User, Verifier ],
  controller: Password,
  signer: Ed25519,
  hasher: Blake3,
  cipher: X25519SalsaPoly,
});

identity.agents.user.name = 'Bob'
passed = identity.agents.user.name === 'Bob'
console.log(`set name:`, passed)

await identity.controller.incept({ password: 'password' })
passed = identity.controller.keyEventLog.length === 2
console.log(`incepted:`, passed)

await identity.controller.rotate({ password: 'password' })
passed = identity.controller.keyEventLog.length === 3
console.log(`rotated:`, passed)

passed = await identity.agents.verifier.verifyEventLog(identity.controller.keyEventLog)
console.log(`eventlog valid:`, passed)

const test = identity.cipher.encrypt({ data: { message: 'hello world' } })
const decrypted = identity.cipher.decrypt({ data: test })
passed = JSON.stringify(decrypted) === JSON.stringify({ message: 'hello world' })
console.log(`encryption/decryption:`, passed)
