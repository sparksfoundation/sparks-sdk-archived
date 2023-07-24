import { Spark } from '../dist/index.js';
import { Ed25519Password } from '../dist/signers/Ed25519Password/index.js';
import { X25519SalsaPolyPassword } from '../dist/ciphers/X25519SalsaPolyPassword/index.js';
import { Blake3 } from '../dist/hashers/Blake3/index.js';
import { Basic } from '../dist/controllers/Basic/index.js';
import { randomSalt } from '../dist/utilities/index.js';
import { assert } from 'console';

(async function() {
    const alice = new Spark({
      cipher: X25519SalsaPolyPassword,
      controller: Basic,
      hasher: Blake3,
      signer: Ed25519Password,
    });

    const salt = randomSalt();

    await alice.incept({ 
      signer: { password: 'test', salt: salt },
      cipher: { password: 'test', salt: salt },
    }).catch(console.log)
    
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