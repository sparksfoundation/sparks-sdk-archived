import { Spark, Blake3, Random, Ed25519, X25519SalsaPoly, WebRTC } from '../dist/index.mjs';
import wrtc from 'wrtc';

let passed

const alice = new Spark({
    controller: Random,
    signer: Ed25519,
    hasher: Blake3,
    cipher: X25519SalsaPoly,
});
await alice.incept();

WebRTC.receive(({ details, resolve, reject }) => {
    console.log(details)
}, { spark: alice, wrtc })
    
const bob = new Spark({
    controller: Random,
    signer: Ed25519,
    hasher: Blake3,
    cipher: X25519SalsaPoly,
});
await bob.incept();

const bobChannel = new WebRTC({ spark: bob, wrtc })

