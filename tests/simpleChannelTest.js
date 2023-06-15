import { Spark, Blake3, Random, Ed25519, X25519SalsaPoly, User, Verifier, PostMessage } from '../dist/index.js';
import { _0000, _1111 } from './testWindows.js';

const website = new Spark({ 
  agents: [Verifier], 
  controller: Random, 
  signer: Ed25519, 
  hasher: Blake3, 
  cipher: X25519SalsaPoly, 
  channels: [PostMessage] 
});
await website.controller.incept();

website.channels.PostMessage.receive(async ({ resolve }) => {
  const channel = await resolve();
  channel.onmessage = res => {
    console.log(res)
  }
}, website, _1111);

const alice = new Spark({ 
  agents: [User], 
  controller: Random, 
  signer: Ed25519, 
  hasher: Blake3, 
  cipher: X25519SalsaPoly, 
  channels: [PostMessage] 
});
await alice.controller.incept();

const channels = new alice.channels.PostMessage({ _window: _0000 })
const channel = await channels.open({ url: 'http://localhost:1111' })
console.log('channel receipt: ', channel.receipt)
const receipt = await channel.message('hey website')
console.log('message receipt: ', receipt)
