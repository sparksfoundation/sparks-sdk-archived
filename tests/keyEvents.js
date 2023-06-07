import { Agent, X25519SalsaPoly, Ed25519, Verifier, Blake3, Password, Random, PostMessage } from '../dist/index.js';

const UserAgent = Agent(Ed25519, X25519SalsaPoly, Blake3, Password);
const VerifierAgent = Agent(Random, Verifier, Blake3, Ed25519, X25519SalsaPoly);

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
