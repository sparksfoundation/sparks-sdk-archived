import { Spark } from '../dist/index.mjs';
import { Ed25519 } from '../dist/signer/Ed25519/index.mjs';
import { X25519SalsaPoly } from '../dist/cipher/X25519SalsaPoly/index.mjs';
import { SparkError } from '../dist/common/errors.mjs';
import { assert } from 'console';
import { Blake3 } from '../dist/hasher/Blake3/Blake3.mjs';
import { Basic } from '../dist/controller/Basic/index.mjs';

(async function() {
  try {

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
    const keyPairs = await spark.generateKeyPairs();
    const peerKeyPairs = await spark.generateKeyPairs();
  
    spark.setKeyPairs({ keyPairs });
    peer.setKeyPairs({ keyPairs: peerKeyPairs });
  
    const encrypted = await spark.encrypt({ data });
    const decrypted = await spark.decrypt({ data: encrypted });
  
    const asymmetricEncrypted = await spark.encrypt({ data, publicKey: peer.publicKeys.encryption });
    const asymmetricDecrypted = await spark.decrypt({ data: asymmetricEncrypted, publicKey: peer.publicKeys.encryption });
  
    const sharedKey = await spark.generateSharedEncryptionKey({ publicKey: peer.publicKeys.encryption });
    const sharedEcnrypted = await spark.encrypt({ data, sharedKey });
    const sharedDecrypted = await spark.decrypt({ data: sharedEcnrypted, sharedKey });
  
    assert(!(keyPairs instanceof SparkError), 'cipher - keys generated');
    assert(!(peerKeyPairs instanceof SparkError), 'cipher - next keys generated');
    
    assert(!(encrypted instanceof SparkError), 'cipher - data encrypted');
    assert(!(decrypted instanceof SparkError) && decrypted === data, 'cipher - data decrypted');
    
    assert(!(asymmetricEncrypted instanceof SparkError), 'cipher - data asymmetricEncrypted');
    assert(!(asymmetricDecrypted instanceof SparkError) && asymmetricDecrypted === data, 'cipher - data asymmetricDecrypted');
  
    assert(!(sharedKey instanceof SparkError), 'cipher - data sharedKey');
    assert(!(sharedEcnrypted instanceof SparkError), 'cipher - data sharedEcnrypted');
    assert(!(sharedDecrypted instanceof SparkError) && sharedDecrypted === data, 'cipher - data sharedDecrypted');
  } catch (e) {
    console.error(e);
  }
}())