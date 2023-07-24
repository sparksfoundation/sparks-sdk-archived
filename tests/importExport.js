import { Spark } from '../dist/index.js';
import { Ed25519Password } from '../dist/signers/Ed25519Password/index.js';
import { X25519SalsaPolyPassword } from '../dist/ciphers/X25519SalsaPolyPassword/index.js';
import { Blake3 } from '../dist/hashers/Blake3/index.js';
import { Basic } from '../dist/controllers/Basic/index.js';
import { randomSalt } from '../dist/utilities/index.js';
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
