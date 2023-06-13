import { Spark, Blake3, Random, Ed25519, X25519SalsaPoly, User, Verifier, PostMessage } from '../dist/index.js';
import MockWindow from './mocks/MockWindow.js';
let passed

//global.window = new MockWindow('http://localhost:3000');

const website = new Spark({
  agents: [ User, Verifier ],
  controller: Random,
  signer: Ed25519,
  hasher: Blake3,
  cipher: X25519SalsaPoly,
  channels: [ PostMessage ],
});

await website.controller.incept();

const alice = new Spark({
  agents: [ User, Verifier ],
  controller: Random,
  signer: Ed25519,
  hasher: Blake3,
  cipher: X25519SalsaPoly,
  channels: [ PostMessage ],
});

const channel = website.channels.postMessage.create({
  request: { origin: 'http://localhost:3000', publicKey: website.controller.signingKeys.publicKey },
})

channel.open()