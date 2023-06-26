import { Spark } from '../dist/index.mjs';
import { Blake3 } from '../dist/hasher/Blake3/Blake3.mjs';
import { Ed25519 } from '../dist/signer/Ed25519/index.mjs';
import { X25519SalsaPoly } from '../dist/cipher/X25519SalsaPoly/index.mjs';
import { SparkError } from '../dist/common/errors.mjs';
import { assert } from 'console';

export default async function test() {
  const spark = new Spark({
    cipher: X25519SalsaPoly,
    hasher: Blake3,
    signer: Ed25519,
  });

  spark.setEncryptionKeyPair(await spark.generateEncryptionKeyPair());
  spark.setSigningKeyPair(await spark.generateSigningKeyPair());

  // TODO - we may need a base class for signer, hasher, etc.. that set consistent interface for setting and getting core primitives.
  // this so that we can expand types of signers, hashers, etc.. without breaking the interface making it extensible while maintaining compatibility for core events (controller)

  let keys = spark.keyPairs;
  let next = await spark.generateKeyPairs();

  await spark.incept(keys);
  assert(!(spark.keyEventLog instanceof SparkError) && spark.keyEventLog.length === 1 && spark.keyEventLog[0].type === 'INCEPT', 'controller - incepted');
  
  await spark.rotate(next);
  assert(!(spark.keyEventLog instanceof SparkError) && spark.keyEventLog.length === 2 && spark.keyEventLog[1].type === 'ROTATE', 'controller - rotated');

  spark.setEncryptionKeyPair(next.encryption);
  spark.setSigningKeyPair(next.signing);
  keys = { ...next }
  next = await spark.generateKeyPairs();
  await spark.rotate(next);
  assert(!(spark.keyEventLog instanceof SparkError) && spark.keyEventLog.length === 3 && spark.keyEventLog[2].type === 'ROTATE', 'controller - rotated');

  spark.setEncryptionKeyPair(next.encryption);
  spark.setSigningKeyPair(next.signing);
  await spark.destroy();
  assert(!(spark.keyEventLog instanceof SparkError) && spark.keyEventLog.length === 4 && spark.keyEventLog[3].type === 'DESTROY', 'controller - destroyed');
}
