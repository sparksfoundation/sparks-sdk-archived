import { Spark } from '../dist/index.mjs';
import { Ed25519Password } from '../dist/signers/Ed25519/index.mjs';
import { Blake3 } from '../dist/hashers/Blake3/index.mjs';
import { Basic } from '../dist/controllers/Basic/index.mjs';
import { X25519SalsaPolyPassword } from '../dist/ciphers/X25519SalsaPoly/index.mjs';
import { assert } from 'console';
import cuid from 'cuid';

(async function() {
    const spark = new Spark({
      cipher: X25519SalsaPolyPassword,
      controller: Basic,
      hasher: Blake3,
      signer: Ed25519Password,
    });
  
    const salt = cuid();
    let keyPairs = await spark.generateKeyPairs({ password: 'password', salt })
      .catch(e => assert(false, 'password - keys generated'));

    await spark.setKeyPairs(keyPairs)
      .catch(e => assert(false, 'password - keys set'));

    const firstKeys = spark.keyPairs;
    
    keyPairs = await spark.generateKeyPairs({ password: 'password', salt })
      .catch(e => assert(false, 'password - keys generated'));

    await spark.setKeyPairs(keyPairs)
      .catch(e => assert(false, 'password - keys set'));

    const secondKeys = spark.keyPairs;

    assert(JSON.stringify(firstKeys) === JSON.stringify(secondKeys), 'password - first and second keys match');

}())