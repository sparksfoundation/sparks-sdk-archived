import { Spark, Blake3, Random, Ed25519, X25519SalsaPoly, User, Verifier, PostMessage } from '../dist/index.js';
import { _0000, _1111 } from './testWindows.js';

const website = new Spark({ agents: [Verifier], controller: Random, signer: Ed25519, hasher: Blake3, cipher: X25519SalsaPoly, channels: [PostMessage] });
await website.controller.incept();
website.channels.PostMessage.receive(async ({ details, resolve, reject }) => {
    const channel = await resolve();
    channel.onmessage = res => {
    }
}, { spark: website, _window: _1111 });

const alice = new Spark({ agents: [User], controller: Random, signer: Ed25519, hasher: Blake3, cipher: X25519SalsaPoly, channels: [PostMessage] });
await alice.controller.incept();

const channel = new alice.channels.PostMessage({
    source: _1111,
    origin: 'http://localhost:1111',
    _window: _0000,
})

channel.onerror = err => console.log(err, 'here')
const test = await channel.open()
const receipt = await test.send('hey website')
// await test.close()

