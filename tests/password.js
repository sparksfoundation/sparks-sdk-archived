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

    // you would never do this in production
    // instead you should use import / export
    // but to ensure consistent key generation
    // we are using the same salt

    const firstKeys = await alice.incept({ 
      signer: { password: 'test', salt: cuid() },
      cipher: { password: 'test', salt: cuid() },
    });

    const aliceLater = new Spark({
      cipher: X25519SalsaPolyPassword,
      controller: Basic,
      hasher: Blake3,
      signer: Ed25519Password,
    });

    const secondKeys = await aliceLater.incept({
      signer: { password: 'test', salt: cuid() },
      cipher: { password: 'test', salt: cuid() },
    });


    assert(JSON.stringify(firstKeys) === JSON.stringify(secondKeys), 'password - first and second keys match');
    
  
    // const salt = cuid();

    // let keyPairs = await spark.generateKeyPairs({ password: 'password', salt })
    //   .catch(e => assert(false, 'password - keys generated'));

    // await spark.setKeyPairs(keyPairs)
    //   .catch(e => assert(false, 'password - keys set'));

    // const firstKeys = spark.keyPairs;
    
    // keyPairs = await spark.generateKeyPairs({ password: 'password', salt })
    //   .catch(e => assert(false, 'password - keys generated'));

    // await spark.setKeyPairs(keyPairs)
    //   .catch(e => assert(false, 'password - keys set'));

    // const secondKeys = spark.keyPairs;

    // assert(JSON.stringify(firstKeys) === JSON.stringify(secondKeys), 'password - first and second keys match');

}())