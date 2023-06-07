import { CastingAgent, X25519SalsaPoly, Ed25519, Verifier, Blake3, Password, Random, PostMessage } from '../dist/index.js';
import MockWindow from './mocks/MockWindow.js';

const UserAgent = CastingAgent(Ed25519, X25519SalsaPoly, Blake3, Password);
const VerifierAgent = CastingAgent(Random, Verifier, Blake3, Ed25519, X25519SalsaPoly);
const CommsTest = CastingAgent(Random, Ed25519, X25519SalsaPoly, Blake3, PostMessage);

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

// mock window to test channel
global.window = new MockWindow('http://localhost:3000');

const alice = new CommsTest();
alice.incept();
const aliceChannel = alice.postMessage();

const bob = new CommsTest();
bob.incept();
const bobChannel = bob.postMessage();

// bob accepts alice's connection request
bobChannel.accept({ url: 'http://localhost:3000' })
bobChannel.on('message', async (message) => {
  console.log('passed: bob received message', message)
  await bobChannel.disconnect()
})
bobChannel.on('connected', () => {
  console.log('passed: bob received connected')
})
bobChannel.on('disconnected', () => {
  console.log('passed: bob received disconnected')
})

aliceChannel.on('connected', async () => {
  console.log('passed: alice received connected')
})
aliceChannel.on('disconnected', () => {
  console.log('passed: alice received disconnected')
})

aliceChannel.connect({ url: 'http://localhost:3000' })
  .then(async () => {
    await aliceChannel.send({ data: 'hello bob' })
  })

console.log('passed: all tests')
