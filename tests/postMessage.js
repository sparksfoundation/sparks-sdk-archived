import { Spark, Blake3, Random, Ed25519, X25519SalsaPoly, PostMessage } from '../dist/index.mjs';
import { _0000, _1111 } from './mocks/MockWindow.js';

const website = new Spark({ 
  controller: Random, 
  signer: Ed25519, 
  hasher: Blake3, 
  cipher: X25519SalsaPoly 
});

await website.controller.incept();

PostMessage.receive(async ({ details, resolve, reject }) => {
  console.log('\nchannel details\n', details, '\n')
  // reject() remove reolve below to test this

  const channel = await resolve();
  channel.onmessage = res => {
    console.log('\npotential channel message\n', res, '\n')
  }
}, { spark: website, _window: _1111 });

const alice = new Spark({ 
  controller: Random, 
  signer: Ed25519, 
  hasher: Blake3, 
  cipher: X25519SalsaPoly 
});

await alice.controller.incept();

const channel = new PostMessage({
  source: _1111,
  origin: 'http://localhost:1111',
  _window: _0000,
  spark: alice,
})

channel.onerror = err => {
  console.log('\nchannel error\n', err, '\n')
}

// wait for channel to open
await channel.open()
console.log('\nchannel ready\n')

setTimeout(async () => {
  const msgReceipt = await channel.send('hey website')
  console.log('\nmessage receipt\n', msgReceipt, '\n')
  const closeReceipt = await channel.close()
  console.log('\nclose receipt\n', closeReceipt, '\n')
}, 1000)
