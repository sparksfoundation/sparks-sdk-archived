import { Spark, Blake3, Random, Ed25519, X25519SalsaPoly, User, Verifier, PostMessage } from '../dist/index.js';
import MockWindow from './mocks/MockWindow.js';
const windwowA = new MockWindow('http://localhost:1111');
const windwowB = new MockWindow('http://localhost:0000');
const website = new Spark({ agents: [User, Verifier], controller: Random, signer: Ed25519, hasher: Blake3, cipher: X25519SalsaPoly, channels: [PostMessage] });
await website.controller.incept();
const alice = new Spark({ agents: [User, Verifier], controller: Random, signer: Ed25519, hasher: Blake3, cipher: X25519SalsaPoly, channels: [PostMessage] });
await alice.controller.incept();


website.channels.PostMessage.receive(async ({ resolve }) => {
  const channel = await resolve();
  channel.onmessage = res => {
    console.log(res)
  }
}, website, windwowA);


const channels = new alice.channels.PostMessage({ _window: windwowB })
const channel = await channels.open({ url: 'http://localhost:1111' })
channel.message('hey website')
