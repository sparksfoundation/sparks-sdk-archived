import { Spark } from '../dist/index.mjs';
import { Ed25519 } from '../dist/signers/Ed25519/index.mjs';
import { X25519SalsaPoly } from '../dist/ciphers/X25519SalsaPoly/index.mjs';
import { assert } from 'console';
import { Blake3 } from '../dist/hashers/Blake3/Blake3.mjs';
import { Basic } from '../dist/controllers/Basic/index.mjs';

(async function() {
    const spark = new Spark({
      cipher: X25519SalsaPoly,
      controller: Basic,
      hasher: Blake3,
      signer: Ed25519,
    });
  
    const peer = new Spark({
      cipher: X25519SalsaPoly,
      controller: Basic,
      hasher: Blake3,
      signer: Ed25519,
    });
  
    const data = 'Test Data';

    const keyPairs = await spark.generateKeyPairs()
      .catch(e => assert(false, 'signer - keys generated'));

    const peerKeyPairs = await spark.generateKeyPairs()
      .catch(e => assert(false, 'signer - keys generated'));
  
    spark.setKeyPairs(keyPairs)
      .catch(e => assert(false, 'signer - keys set'));

    peer.setKeyPairs(peerKeyPairs)
      .catch(e => assert(false, 'signer - keys set'));
  
    const encrypted = await spark.encrypt({ data })
      .catch(e => assert(false, 'cipher - data encrypted'));

    await spark.decrypt({ data: encrypted })
      .catch(e => assert(false, 'cipher - data decrypted'));
  
    const asymmetricEncrypted = await spark.encrypt({ data, publicKey: peer.publicKeys.cipher })
      .catch(e => assert(false, 'cipher - data encrypted'));

    await spark.decrypt({ data: asymmetricEncrypted, publicKey: peer.publicKeys.cipher })
      .catch(e => assert(false, 'cipher - data decrypted'));
  
    const sharedKey = await spark.generateCipherSharedKey({ publicKey: peer.publicKeys.cipher })
      .catch(e => assert(false, 'cipher - shared key generated'));

    const sharedEcnrypted = await spark.encrypt({ data, sharedKey })
      .catch(e => assert(false, 'cipher - data encrypted'));

    await spark.decrypt({ data: sharedEcnrypted, sharedKey })
      .catch(e => assert(false, 'cipher - data decrypted'));
  
}())