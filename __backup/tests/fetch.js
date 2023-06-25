import { Spark } from '../dist/index.mjs';
import { Random } from '../dist/controllers/index.mjs';
import { Ed25519 } from '../dist/signers/index.mjs';
import { Blake3 } from '../dist/hashers/index.mjs';
import { X25519SalsaPoly } from '../dist/ciphers/index.mjs';
import { FetchAPI } from '../dist/channels/Http/index.mjs';

import fetch from 'node-fetch';
global.fetch = fetch;

const channels = [];
const max_users = 2;
for (let i = 0; i < max_users; i++) {
  const client = new Spark({
    controller: Random,
    signer: Ed25519,
    hasher: Blake3,
    cipher: X25519SalsaPoly,
  });
  await client.controller.incept();
  const channel = new FetchAPI({
    url: 'http://127.0.0.1:3400/restAPI',
    spark: client,
  })
  await channel.open();
  console.log('user', (i + 1), 'connected');
  channels.push(channel);
}

// test by iterating over all sparks and sending a message from each
// there should be a delay between each message
const delay = 100;
let i = 0;
while(true) {
  const channel = channels[i++ % max_users];
  await channel.send(Math.random().toString(36).substring(2, 8));
  await new Promise(resolve => setTimeout(resolve, delay));
}