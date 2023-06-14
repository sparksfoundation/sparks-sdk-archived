import { Spark, Blake3, Random, Ed25519, X25519SalsaPoly, User, Verifier, PostMessage } from '../dist/index.js';
import MockWindow from './mocks/MockWindow.js';

const website = new Spark({ agents: [ User, Verifier ], controller: Random, signer: Ed25519, hasher: Blake3, cipher: X25519SalsaPoly, channels: [ PostMessage ] });
await website.controller.incept();
website.channels.postMessage.init(new MockWindow('http://localhost:3000'))

const websiteChannel = website.channels.postMessage.recieve(async ({ cid, target, resolve, reject }) => {
  const conn = await resolve() // accept the connection
  // reject() // reject the connection
  // target / cid => for making a decision
  console.log('heyy', conn)
})

const alice = new Spark({ agents: [ User, Verifier ], controller: Random, signer: Ed25519, hasher: Blake3, cipher: X25519SalsaPoly, channels: [ PostMessage ] });
await alice.controller.incept();

alice.channels.postMessage.init(new MockWindow('http://localhost:4000')) 

const channel = await alice.channels.postMessage.connect('http://localhost:3000')
console.log('channel', channel)
// const receipt = await channel.send('hey')

// const encrypted = await alice.signer.verify({ signature: receipt, publicKey: channel.target.publicKey })
// const decrypted = await alice.cipher.decrypt({ data: encrypted, sharedKey: channel.sharedKey })

// const res = await channel.disconnect()
