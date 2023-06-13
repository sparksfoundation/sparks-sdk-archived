import { Spark, Blake3, Random, Ed25519, X25519SalsaPoly, User, Verifier, PostMessage } from '../dist/index.js';
import MockWindow from './mocks/MockWindow.js';

globalThis.window = new MockWindow('http://localhost:3000')

const website = new Spark({ agents: [ User, Verifier ], controller: Random, signer: Ed25519, hasher: Blake3, cipher: X25519SalsaPoly, channels: [ PostMessage ] });
await website.controller.incept();

const websiteChannel = website.channels.postMessage.recieve(async (opts, resolve, reject) => {
  const conn = await resolve()
  conn.on('message', (msg) => {
    console.log('recieved at', msg)
  })

  conn.on('disconnect', (res) => {
    console.log('disconnected', res)
  })
})

const alice = new Spark({ agents: [ User, Verifier ], controller: Random, signer: Ed25519, hasher: Blake3, cipher: X25519SalsaPoly, channels: [ PostMessage ] });
await alice.controller.incept();

const channel = await alice.channels.postMessage.connect('http://localhost:3000')

const receipt = await channel.send('hey')
console.log('sent', receipt)

const encrypted = await alice.signer.verify({ signature: receipt, publicKey: channel.target.publicKey })
const decrypted = await alice.cipher.decrypt({ data: encrypted, sharedKey: channel.sharedKey })

console.log('confirmed recieved at', decrypted)
const res = await channel.disconnect()
console.log('disconnected', res)
