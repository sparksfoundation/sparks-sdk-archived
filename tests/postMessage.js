import { Spark, Blake3, Random, Ed25519, X25519SalsaPoly, User, Verifier, PostMessage } from '../dist/index.js';
import MockWindow from './mocks/MockWindow.js';

const website = new Spark({ agents: [User, Verifier], controller: Random, signer: Ed25519, hasher: Blake3, cipher: X25519SalsaPoly, channels: [PostMessage] });
await website.controller.incept();

website.channels.PostMessage.receive(async ({ details, resolve, reject }) => {
    const channel = await resolve();
    console.log('reciever channel opened')
}, website, new MockWindow('http://localhost:3000'));

const alice = new Spark({ agents: [User, Verifier], controller: Random, signer: Ed25519, hasher: Blake3, cipher: X25519SalsaPoly, channels: [PostMessage] });
await alice.controller.incept();

const channels = new alice.channels.PostMessage({ _window: new MockWindow('http://localhost:4000') })
const channel = await channels.open({ url: 'http://localhost:3000' })
console.log('initiator channel opened')

// channel.open = () => { }
// channel.onopen = () => { }
// channel.close = () => { }
// channel.onclose = () => { }
// channel.message = (data) => { }
// channel.onmessage = () => { }
// channel.onerror = () => { }





// alice.channels.PostMessage.receive(({ request, resolve, reject }) => {
//   // console.log(request)
// })