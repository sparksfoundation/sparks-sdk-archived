import { Spark, Blake3, Random, Ed25519, X25519SalsaPoly, User, Verifier, PostMessage } from '../dist/index.js';
import MockWindow from './mocks/MockWindow.js';

const website = new Spark({ agents: [User, Verifier], controller: Random, signer: Ed25519, hasher: Blake3, cipher: X25519SalsaPoly, channels: [PostMessage] });
await website.controller.incept();

website.channels.PostMessage.receive(async ({ details, resolve, reject }) => {
  const channel = await resolve();
  channel.onmessage = res => console.log('ME 1111 onmessage', res.mid)
  channel.onclose = res => console.log('CE 1111 onclose', !!receipt)
  channel.onerror = res => console.log('EE 1111 onerror', res.cid)
  reject(); // no-op the channel is already open move up to see error
  const receipt = await channel.message('test')
  console.log('1111 recieved valid receipt')
  const res = await channel.close();
  console.log('1111 channel closed');
}, website, new MockWindow('http://localhost:1111'));

const alice = new Spark({ agents: [User, Verifier], controller: Random, signer: Ed25519, hasher: Blake3, cipher: X25519SalsaPoly, channels: [PostMessage] });
await alice.controller.incept();

const channels = new alice.channels.PostMessage({ _window: new MockWindow('http://localhost:4444') })
const channel = await channels.open({ url: 'http://localhost:1111' })
channel.onmessage = res => console.log('ME 4444 onmessage', res.mid)
channel.onclose = res => console.log('CE 4444 onclose', !!receipt)
channel.onerror = res => console.log('EE 4444 onerror', res.cid)
console.log('4444 channel opened')
const receipt = await channel.message('test');
console.log('4444 recieved valid receipt')


// alice.channels.PostMessage.receive(({ request, resolve, reject }) => {
//   // console.log(request)
// })