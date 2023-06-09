import { CastingAgent, Verifier, Blake3, X25519SalsaPoly, Ed25519, Random, Password } from '../dist/index.js'

const UserAgent = new CastingAgent({
  agents: [ Verifier ],
  hash: Blake3,
  sign: Ed25519,
  encrypt: X25519SalsaPoly,
  derive: Password,
})

const VerifierAgent = new CastingAgent({
  agents: [ Verifier ],
  hash: Blake3,
  sign: Ed25519,
  encrypt: X25519SalsaPoly,
  derive: Random,
})

const user = new UserAgent();
await user.incept({ password: 'password' });
await user.rotate({ password: 'password', newPassword: 'password2' });
await user.rotate({ password: 'password2' });
await user.rotate({ password: 'password2' });

const encrypted = user.encrypt({ data: 'hello world' })
const decrypted = user.decrypt({ data: encrypted })
console.log(`encryption/decryption`, decrypted === 'hello world')

const verifier = new VerifierAgent();
const valid = verifier.verifyEventLog(user.keyEventLog);
console.log(`eventlog valid`, valid);
