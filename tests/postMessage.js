import { CastingAgent, X25519SalsaPoly, Ed25519, Blake3, Random, PostMessage } from '../dist/index.js';
import MockWindow from './mocks/MockWindow.js';

const CommsAgent = CastingAgent({
    encrypt: X25519SalsaPoly,
    sign: Ed25519,
    hash: Blake3,
    derive: Random,
    channels: [PostMessage],
});

// mock window to test channel
global.window = new MockWindow('http://localhost:3000');

const website = new CommsAgent();
website.incept();

// website accepts alice's connection request
website.postMessage.open({
    onOpen: conn => {
        console.log('website connected')
    },
    onMessage: name => console.log(`hello: ${name}!`),
    onClose: id => console.log(`closed: ${id}!`),
})

const alice = new CommsAgent();
alice.incept();

alice.postMessage.open({
    target: 'http://localhost:3000',
    onOpen: conn => {
        console.log('alice connected')
        conn.message('Alice').then((signature) => {
            const data = alice.verify({ signature, publicKey: conn.publicKeys.signing })
            const verified = data.cid === conn.cid && data.message === 'Alice'
            console.log(verified)
        })
        conn.close()
    },
    onClose: name => console.log(`closed: ${name}!`),
    onMessage: id => console.log(`hello: ${id}!`),
})

console.log('passed: all tests')