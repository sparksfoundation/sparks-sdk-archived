import { Spark } from '../dist/index.mjs';
import { Ed25519 } from '../dist/signer/Ed25519/index.mjs';
import { X25519SalsaPoly } from '../dist/cipher/X25519SalsaPoly/index.mjs';
import { SparkError } from '../dist/common/errors.mjs';
import { Blake3 } from '../dist/hasher/Blake3/index.mjs';
import { assert } from 'console';

export default async function() {
  const spark = new Spark({
    cipher: X25519SalsaPoly,
    hasher: Blake3,
    signer: Ed25519,
  });

  const data = { test: 'test' };
  await spark.initSingingKeys();
  const keys = spark.signingKeys;
  const next = await spark.nextSigningKeys();
  const signed = await spark.sign(data);
  const verified = await spark.verify({ data, signature: signed, publicKey: keys.publicKey });

  const sealed = await spark.seal(data);
  const opened = await spark.open({ publicKey: keys.publicKey, signature: sealed });

  assert(!(keys instanceof SparkError), 'signer - keys generated');
  assert(!(next instanceof SparkError), 'signer - next keys generated');
  assert(!(signed instanceof SparkError), 'signer - data signed');
  assert(!(verified instanceof SparkError), 'signer - data verified');
  assert(!(sealed instanceof SparkError), 'signer - data sealed');
  assert(!(opened instanceof SparkError), 'signer - data opened');
}