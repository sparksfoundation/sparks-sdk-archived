import { Spark } from '../dist/index.js';
import { Basic } from '../dist/controllers/Basic/index.js';
import { X25519SalsaPoly } from '../dist/ciphers/X25519SalsaPoly/index.js';
import { Blake3 } from '../dist/hashers/Blake3/index.js';
import { Ed25519 } from '../dist/signers/Ed25519/index.js';
import { PostMessage } from '../dist/channels/PostMessage/index.js';
import { assert } from 'console';
import { Window } from './utilities/Window.js';

(async function () {
  const webWindow = new Window('http://localhost:1111');
  const aliceWindow = new Window('http://localhost:0000');

  const website = new Spark({
    cipher: X25519SalsaPoly,
    controller: Basic,
    hasher: Blake3,
    signer: Ed25519,
  });

  const keyPairs = await website._generateKeyPairs();
  await website.incept(keyPairs)

  const alice = new Spark({
    cipher: X25519SalsaPoly,
    controller: Basic,
    hasher: Blake3,
    signer: Ed25519,
  });

  await alice.incept()

  PostMessage.receive(async ({ event, confirmOpen, rejectOpen }) => {
    const channel = await confirmOpen();
    channel.on(channel.eventTypes.MESSAGE_REQUEST, async (event) => {
      const message = await channel.getEventData(event);
      console.log('w: ', message);
    });

    await channel.message('hey alice')
  }, { spark: website, _window: webWindow, _source: aliceWindow });

  const channel = new PostMessage({
    peer: { origin: webWindow.origin },
    spark: alice,
    source: webWindow,
    _window: aliceWindow,
  });

  channel.on(channel.eventTypes.MESSAGE_REQUEST, async (event) => {
    const message = await channel.getEventData(event);
    console.log('a: ', message);
  });

  channel.on(channel.eventTypes.ANY_ERROR, async (event) => {
    console.log('ANY_ERROR: ', event);
  });

  await channel.open()
  await channel.message('hey website');
  await channel.message('hey website');
  await channel.message('hey website');
  await channel.message('hey website');
  await channel.close();

  await new Promise((resolve) => setTimeout(resolve, 200));
  const backup = channel.export();
  console.log(backup.eventLog.length)

  const newChannes = new PostMessage({
    spark: alice,
    source: webWindow,
    peer: { origin: webWindow.origin },
    _window: aliceWindow,
  });

  newChannes.on(channel.eventTypes.ANY_EVENT, async (event) => {
    console.log('a: ', event.type);
  });

  await newChannes.import(backup);
  await newChannes.open();

  await new Promise((resolve) => setTimeout(resolve, 200));
  await newChannes.close();

  console.log(newChannes.export().eventLog.length)

  console.log('done')
}())