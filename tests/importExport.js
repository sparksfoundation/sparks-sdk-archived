import { Spark } from '../dist/index.mjs';
import { Blake3 } from '../dist/hashers/Blake3/Blake3.mjs';
import { Ed25519Password } from '../dist/signers/Ed25519/index.mjs';
import { X25519SalsaPolyPassword } from '../dist/ciphers/X25519SalsaPoly/index.mjs';
import { Basic } from '../dist/controllers/Basic/index.mjs';
import { randomSalt } from '../dist/utilities/index.mjs';
import { assert } from 'console';

(async function () {
  const spark = new Spark({
    cipher: X25519SalsaPolyPassword,
    controller: Basic,
    hasher: Blake3,
    signer: Ed25519Password,
  });

  const salt = randomSalt();
  await spark.incept({ password: 'password', salt })

  const data = await spark.export();

  const test = new Spark({
    cipher: X25519SalsaPolyPassword,
    controller: Basic,
    hasher: Blake3,
    signer: Ed25519Password,
  });

  
  await test.import({
    password: 'password',
    salt,
    data,
  });

  assert(spark.identifier === test.identifier, 'identifiers match');
  assert(spark.publicKeys.signer === test.publicKeys.signer, 'signer public keys match');
  assert(spark.publicKeys.cipher === test.publicKeys.cipher, 'cipher public keys match');
}())
