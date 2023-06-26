import { Spark } from '../dist/index.mjs';
import { Ed25519 } from '../dist/signer/Ed25519/index.mjs';
import { X25519SalsaPoly } from '../dist/cipher/X25519SalsaPoly/index.mjs';
import { SparkError } from '../dist/common/errors.mjs';
import { assert } from 'console';
import { Blake3 } from '../dist/hasher/Blake3/Blake3.mjs';

export default async function() {
  const spark = new Spark({
    cipher: X25519SalsaPoly,
    hasher: Blake3,
    signer: Ed25519,
  });

  const peer = new Spark({
    cipher: X25519SalsaPoly,
    hasher: Blake3,
    signer: Ed25519,
  });

  const data = 'Test Data';
  peer.setEncryptionKeyPair(await peer.generateEncryptionKeyPair());
  spark.setEncryptionKeyPair(await spark.generateEncryptionKeyPair());
  const keys = spark.encryptionKeyPair;
  const next = spark.nextEncryptionKeyPair;
  const encrypted = await spark.encrypt({ data });
  const decrypted = await spark.decrypt({ data: encrypted });
  const sharedKey = await spark.generateSharedEncryptionKey(peer.encryptionKeyPair.publicKey);
  const asymmetricEncrypted = await spark.encrypt({ data, publicKey: peer.encryptionKeyPair.publicKey });
  const asymmetricDecrypted = await spark.decrypt({ data: asymmetricEncrypted, publicKey: peer.encryptionKeyPair.publicKey });
  const sharedEcnrypted = await spark.encrypt({ data, sharedKey });
  const sharedDecrypted = await spark.decrypt({ data: sharedEcnrypted, sharedKey });

  assert(!(keys instanceof SparkError), 'cipher - keys generated');
  assert(!(next instanceof SparkError), 'cipher - next keys generated');
  assert(!(encrypted instanceof SparkError), 'cipher - data encrypted');
  assert(!(decrypted instanceof SparkError) && decrypted === data, 'cipher - data decrypted');
  assert(!(sharedKey instanceof SparkError), 'cipher - data sharedKey');
  assert(!(asymmetricEncrypted instanceof SparkError), 'cipher - data asymmetricEncrypted');
  assert(!(asymmetricDecrypted instanceof SparkError) && asymmetricDecrypted === data, 'cipher - data asymmetricDecrypted');
  assert(!(sharedEcnrypted instanceof SparkError), 'cipher - data sharedEcnrypted');
  assert(!(sharedDecrypted instanceof SparkError) && sharedDecrypted === data, 'cipher - data sharedDecrypted');
}
