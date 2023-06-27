import { Spark } from '../dist/index.mjs';
import { Ed25519 } from '../dist/signer/Ed25519/index.mjs';
import { X25519SalsaPoly } from '../dist/cipher/X25519SalsaPoly/index.mjs';
import { assert } from 'console';
import { Blake3 } from '../dist/hasher/Blake3/Blake3.mjs';
import { Basic } from '../dist/controller/Basic/index.mjs';

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
  
    spark.setKeyPairs({ keyPairs })
      .catch(e => assert(false, 'signer - keys set'));

    peer.setKeyPairs({ keyPairs: peerKeyPairs })
      .catch(e => assert(false, 'signer - keys set'));
  
    const encrypted = await spark.encrypt({ data })
      .catch(e => assert(false, 'cipher - data encrypted'));

    await spark.decrypt({ data: encrypted })
      .catch(e => assert(false, 'cipher - data decrypted'));
  
    const asymmetricEncrypted = await spark.encrypt({ data, publicKey: peer.publicKeys.encryption })
      .catch(e => assert(false, 'cipher - data encrypted'));

    await spark.decrypt({ data: asymmetricEncrypted, publicKey: peer.publicKeys.encryption })
      .catch(e => assert(false, 'cipher - data decrypted'));
  
    const sharedKey = await spark.generateSharedEncryptionKey({ publicKey: peer.publicKeys.encryption })
      .catch(e => assert(false, 'cipher - shared key generated'));

    const sharedEcnrypted = await spark.encrypt({ data, sharedKey })
      .catch(e => assert(false, 'cipher - data encrypted'));

    await spark.decrypt({ data: sharedEcnrypted, sharedKey })
      .catch(e => assert(false, 'cipher - data decrypted'));
  
}())