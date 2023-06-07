import { Agent, X25519SalsaPoly, Ed25519, Blake3, Random, PostMessage } from '../dist/index.js';
import MockWindow from './mocks/MockWindow.js';

const CommsTest = Agent(Random, Ed25519, X25519SalsaPoly, Blake3, PostMessage);

// mock window to test channel
global.window = new MockWindow('http://localhost:3000');

const website = new CommsTest();
website.incept();

// website accepts alice's connection request
website.postMessage.allow({
    url: 'http://localhost:3000',
    onOpen: conn => {
        console.log('website connected')
    },
    onMessage: name => console.log(`hello: ${name}!`),
    onClose: id => console.log(`closed: ${id}!`),
})

const alice = new CommsTest();
alice.incept();

alice.postMessage.open({
    url: 'http://localhost:3000',
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