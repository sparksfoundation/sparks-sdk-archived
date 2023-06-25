import { Spark } from '../dist/index.mjs';
import { Ed25519 } from '../dist/signers/Ed25519/index.mjs';
import { X25519SalsaPoly } from '../dist/ciphers/X25519SalsaPoly/index.mjs';
import { SparkError } from '../dist/common/errors.mjs';

export default async function() {
  const spark = new Spark({
    cipher: X25519SalsaPoly,
    hasher: Ed25519,
    signer: Ed25519,
  });

  const peer = new Spark({
    cipher: X25519SalsaPoly,
    hasher: Ed25519,
    signer: Ed25519,
  });

  await peer.initEncryptionKeys();
  await spark.initEncryptionKeys();
  const keys = spark.encryptionKeys();
  const data = 'Test Data';
  const encrypted = await spark.encrypt({ data });
  const decrypted = await spark.decrypt({ data: encrypted });
  const sharedKey = await spark.computSharedEncryptionKey(peer.encryptionKeys().publicKey);
  const asymmetricEncrypted = await spark.encrypt({ data, publicKey: peer.encryptionKeys().publicKey });
  const asymmetricDecrypted = await spark.decrypt({ data: asymmetricEncrypted, publicKey: peer.encryptionKeys().publicKey });

  const sharedEcnrypted = await spark.encrypt({ data, sharedKey });
  const sharedDecrypted = await spark.decrypt({ data: sharedEcnrypted, sharedKey });

  console.log('keys generated:', !(keys instanceof SparkError));
  console.log('data encrypted:', !(encrypted instanceof SparkError));
  console.log('data decrypted:', !(decrypted instanceof SparkError) && decrypted === data);
  console.log('data sharedKey:', !(sharedKey instanceof SparkError));
  console.log('data asymmetricEncrypted:', !(asymmetricEncrypted instanceof SparkError));
  console.log('data asymmetricDecrypted:', !(asymmetricDecrypted instanceof SparkError) && asymmetricDecrypted === data);
  console.log('data sharedEcnrypted:', !(sharedEcnrypted instanceof SparkError));
  console.log('data sharedDecrypted:', !(sharedDecrypted instanceof SparkError) && sharedDecrypted === data);
}
