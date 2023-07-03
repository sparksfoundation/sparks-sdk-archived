import { Spark } from '../dist/index.mjs';
import { Ed25519 } from '../dist/signers/Ed25519/index.mjs';
import { X25519SalsaPoly } from '../dist/ciphers/X25519SalsaPoly/index.mjs';
import { Blake3 } from '../dist/hashers/Blake3/index.mjs';
import { Basic } from '../dist/controllers/Basic/index.mjs';
import { assert } from 'console';

(async function () {
  const alice = new Spark({
    agents: [Ed25519,],
    cipher: X25519SalsaPoly,
    controller: Basic,
    hasher: Blake3,
    signer: Ed25519,
  });
  await alice.incept();

  const bob = new Spark({
    cipher: X25519SalsaPoly,
    controller: Basic,
    hasher: Blake3,
    signer: Ed25519,
  });

  await bob.incept();

  const data = { test: 'test' };

  const signed = await bob.sign({ data })
    .catch(e => assert(false, 'signer - data signed'));

  const verified = await alice.verify({ data, signature: signed, publicKey: bob.publicKeys.signer })
    .catch(e => assert(false, 'signer - data verified'));

  const sealed = await alice.seal({ data })
    .catch(e => assert(false, 'signer - data sealed'));

  const opened = await bob.open({ publicKey: alice.publicKeys.signer, signature: sealed })
    .catch(e => assert(false, 'signer - data opened'));
}())