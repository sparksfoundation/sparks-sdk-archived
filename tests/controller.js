import { Spark } from '../dist/index.mjs';
import { Blake3 } from '../dist/hasher/Blake3/Blake3.mjs';
import { Ed25519 } from '../dist/signer/Ed25519/index.mjs';
import { X25519SalsaPoly } from '../dist/cipher/X25519SalsaPoly/index.mjs';
import { Basic } from '../dist/controller/Basic/index.mjs';
import { assert } from 'console';

(async function() {
    const spark = new Spark({
      cipher: X25519SalsaPoly,
      controller: Basic,
      hasher: Blake3,
      signer: Ed25519,
    });
  
    let keyPairs = await spark.generateKeyPairs()
      .catch(e => assert(false, 'signer - keys generated'));

    let nextKeyPairs = await spark.generateKeyPairs()
      .catch(e => assert(false, 'signer - keys generated'));

    spark.setKeyPairs({ keyPairs })
      .catch(e => assert(false, 'signer - keys set'));
  
    await spark.incept()
      .catch(e => assert(false, 'controller - incepted'));

    spark.setKeyPairs({ keyPairs })
      .catch(e => assert(false, 'signer - keys set'));

    nextKeyPairs = await spark.generateKeyPairs()
      .catch(e => assert(false, 'signer - keys generated'));

    await spark.rotate({ nextKeyPairs })
      .catch(e => assert(false, 'controller - rotated 1'));
  
    spark.setKeyPairs({ keyPairs: nextKeyPairs })
      .catch(e => assert(false, 'signer - keys set'));

    keyPairs = { ...nextKeyPairs };
    nextKeyPairs = await spark.generateKeyPairs()
      .catch(e => assert(false, 'signer - keys generated'));

    await spark.rotate({ nextKeyPairs })
      .catch(e => assert(false, 'controller - rotated 2'));
  
    await spark.destroy()
      .catch(e => assert(false, 'controller - destroyed'));

}())
