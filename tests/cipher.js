import { Spark } from '../dist/index.js';
import { Ed25519 } from '../dist/signers/Ed25519/index.js';
import { X25519SalsaPoly } from '../dist/ciphers/X25519SalsaPoly/index.js';
import { Blake3 } from '../dist/hashers/Blake3/index.js';
import { Basic } from '../dist/controllers/Basic/index.js';
import { assert } from 'console';

(async function() {
    const alice = new Spark({
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
  
    const data = 'Test Data';

    const encrypted = await alice.encrypt({ data })
      .catch(e => assert(false, 'cipher - data encrypted'));

    const decrypted = await alice.decrypt({ data: encrypted })
      .catch(e => assert(false, 'cipher - data decrypted'));

    assert(data === decrypted, 'cipher - box decrypted data matches');
  
    const asymmetricEncrypted = await alice.encrypt({ data, publicKey: bob.publicKeys.cipher })
      .catch(e => assert(false, 'cipher - data encrypted'));

    const asymmetricDecrypted = await bob.decrypt({ data: asymmetricEncrypted, publicKey: alice.publicKeys.cipher })
      .catch(e => assert(false, 'cipher - data decrypted'));

    assert(data === asymmetricDecrypted, 'cipher - asymmetric decrypted data matches');
  
    const aliceSharedKey = await alice.generateCipherSharedKey({ publicKey: bob.publicKeys.cipher })
      .catch(e => assert(false, 'cipher - alice shared key generated'));

    const sharedEcnrypted = await alice.encrypt({ data, sharedKey: aliceSharedKey })
      .catch(e => assert(false, 'cipher - data encrypted'));

    const bobSharedKey = await bob.generateCipherSharedKey({ publicKey: alice.publicKeys.cipher })
      .catch(e => assert(false, 'cipher - bob shared key generated'));

    const sharedKeyDecrypted = await bob.decrypt({ data: sharedEcnrypted, sharedKey: bobSharedKey })
      .catch(e => assert(false, 'cipher - data decrypted'));

    assert(data === sharedKeyDecrypted, 'cipher - shared key decrypted data matches');
}())