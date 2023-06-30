import { Spark } from '../dist';
import { Ed25519Password } from '../dist/signers/Ed25519';
import { X25519SalsaPolyPassword } from '../dist/ciphers/X25519SalsaPoly';
import { Blake3 } from '../dist/hashers/Blake3';
import { Basic } from '../dist/controllers/Basic';
import { assert } from 'console';

(async function () {
  const alice = new Spark({
    agents: [ Ed25519Password, ],
    cipher: X25519SalsaPolyPassword,
    controller: Basic,
    hasher: Blake3,
    signer: Ed25519Password,
  });

  const bob = new Spark<any, X25519SalsaPolyPassword, Basic, Blake3, Ed25519Password>({
    cipher: X25519SalsaPolyPassword,
    controller: Basic,
    hasher: Blake3,
    signer: Ed25519Password,
  });

  await bob.incept({
    cipher: { password: 'test' },
    signer: { password: 'test' },
  });

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