import { Spark } from '../dist/index.mjs';
import { Ed25519Password } from '../dist/signers/Ed25519/index.mjs';
import { Blake3 } from '../dist/hashers/Blake3/index.mjs';
import { Basic } from '../dist/controllers/Basic/index.mjs';
import { X25519SalsaPolyPassword } from '../dist/ciphers/X25519SalsaPoly/index.mjs';
import { assert } from 'console';
import cuid from 'cuid';

(async function() {
    const alice = new Spark({
      cipher: X25519SalsaPolyPassword,
      controller: Basic,
      hasher: Blake3,
      signer: Ed25519Password,
    });

    const salt = cuid();
    await alice.incept({ 
      signer: { password: 'test', salt: salt },
      cipher: { password: 'test', salt: salt },
    });
    const firstKeys = alice.publicKeys

    const aliceLater = new Spark({
      cipher: X25519SalsaPolyPassword,
      controller: Basic,
      hasher: Blake3,
      signer: Ed25519Password,
    });

    await aliceLater.incept({
      signer: { password: 'test', salt: salt },
      cipher: { password: 'test', salt: salt },
    });
    const secondKeys = aliceLater.publicKeys

    assert(JSON.stringify(firstKeys) === JSON.stringify(secondKeys), 'password - first and second keys match');
}())