import { Spark, Blake3, Password, Ed25519, X25519SalsaPoly, User, Verifier } from '../dist/index.mjs';
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
passed = identity.keyEventLog.length === 2
console.log(`incepted:`, passed)

await identity.controller.rotate({ password: 'password' })
passed = identity.keyEventLog.length === 3
console.log(`rotated:`, passed)

const test = await identity.cipher.encrypt({ data: { message: 'hello world' } })
const decrypted = await identity.cipher.decrypt({ data: test })
passed = JSON.stringify(decrypted) === JSON.stringify({ message: 'hello world' })
console.log(`encryption/decryption:`, passed)

const sign = await identity.sign({ data: { message: 'hello world' } })
const verify = await identity.verify({ signature: sign, publicKey: identity.publicKeys.signing })
passed = JSON.stringify(verify) === JSON.stringify({ message: 'hello world' })
console.log(`sign/verify:`, passed)

passed = await identity.agents.verifier.verifyEventLog(identity.keyEventLog)
console.log(`eventlog valid:`, passed)

