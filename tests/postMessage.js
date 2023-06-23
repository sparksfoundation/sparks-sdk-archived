import { Spark } from '../dist/index.mjs';
import { Blake3 } from '../dist/hashers/index.mjs';
import { Ed25519 } from '../dist/signers/index.mjs';
import { X25519SalsaPoly } from '../dist/ciphers/index.mjs';
import { Random } from '../dist/controllers/index.mjs';
import { PostMessage } from '../dist/channels/PostMessage/index.mjs';

import { _0000, _1111 } from './mocks/MockWindow.js';

const website = new Spark({
  controller: Random,
  signer: Ed25519,
  hasher: Blake3,
  cipher: X25519SalsaPoly
});

await website.controller.incept();

PostMessage.receive(async ({ details, resolve, reject }) => {
  // reject() remove reolve below to test this
  const channel = await resolve();
  const receipt = await channel.send('hey app');
  console.log(channel.receipts)

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
const receipt = await channel.open()
const msgReceipt = await channel.send('hey website')

console.log(channel.receipts)