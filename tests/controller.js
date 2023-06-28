import { Spark } from '../dist/index.mjs';
import { Blake3 } from '../dist/hashers/Blake3/Blake3.mjs';
import { Ed25519Password } from '../dist/signers/Ed25519/index.mjs';
import { X25519SalsaPolyPassword } from '../dist/ciphers/X25519SalsaPoly/index.mjs';
import { Basic } from '../dist/controllers/Basic/index.mjs';
import { assert } from 'console';
import util from 'tweetnacl-util';
import nacl from 'tweetnacl';

(async function() {
    const spark = new Spark({
      cipher: X25519SalsaPolyPassword,
      controller: Basic,
      hasher: Blake3,
      signer: Ed25519Password,
    });

    const salt = util.encodeBase64(nacl.randomBytes(16));
    const password = 'password';
  
    let keyPairs = await spark.generateKeyPairs({ password, salt })
      .catch(e => assert(false, 'signer - keys generated'));

    let nextKeyPairs = await spark.generateKeyPairs({ password, salt })
      .catch(e => assert(false, 'signer - keys generated'));

    spark.setKeyPairs(keyPairs)
      .catch(e => assert(false, 'signer - keys set'));
  
    await spark.incept()
      .catch(e => { console.log(e); assert(false, 'controller - incepted');});

    spark.setKeyPairs(keyPairs)
      .catch(e => { console.log(e); assert(false, 'signer - keys set');});

    nextKeyPairs = await spark.generateKeyPairs({ password, salt })
      .catch(e => { console.log(e); assert(false, 'signer - keys generated');});

    await spark.rotate({ nextKeyPairs })
      .catch(e => { console.log(e); assert(false, 'controller - rotated 1');});
  
    spark.setKeyPairs(nextKeyPairs)
      .catch(e => { console.log(e); assert(false, 'signer - keys set');});

    keyPairs = { ...nextKeyPairs };
    nextKeyPairs = await spark.generateKeyPairs({ password, salt })
      .catch(e => { console.log(e); assert(false, 'signer - keys generated');});

    await spark.rotate({ nextKeyPairs })
      .catch(e => { console.log(e); assert(false, 'controller - rotated 2');});
  
    await spark.destroy()
      .catch(e => { console.log(e); assert(false, 'controller - destroyed');});

}())
