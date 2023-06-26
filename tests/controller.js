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

  await spark.initEncryptionKeys();
  await spark.initSingingKeys();
  await spark.incept();
  const eventLog = spark.keyEventLog;

  assert(!(eventLog instanceof SparkError) && eventLog.length === 1 && eventLog[0].type === 'INCEPT', 'controller - incepted');
}

test();