import { Spark } from '../dist/index.mjs';
import { Ed25519Password } from '../dist/signer/Ed25519/index.mjs';
import { SparkError } from '../dist/common/errors.mjs';
import { Blake3 } from '../dist/hasher/Blake3/index.mjs';
import { Basic } from '../dist/controller/Basic/index.mjs';
import { X25519SalsaPolyPassword } from '../dist/cipher/X25519SalsaPoly/index.mjs';
import { assert } from 'console';

(async function() {
  const spark = new Spark({
    cipher: X25519SalsaPolyPassword,
    controller: Basic,
    hasher: Blake3,
    signer: Ed25519Password,
  });

  const keyPairs = await spark.generateKeyPairs({ password: 'password' }); 
  const { salt } = keyPairs;
  spark.setKeyPairs({ keyPairs});
  const firstKeys = spark.keyPairs;

  const keys = spark.keyPairs;
  spark.setKeyPairs(( await spark.generateKeyPairs({ password: 'password', salt })));
  const secondKeys = spark.keyPairs;

  assert(!(keys instanceof SparkError), 'signer - keys generated');
  assert(!(firstKeys instanceof SparkError), 'signer - first keys generated');
  assert(!(secondKeys instanceof SparkError), 'signer - second keys generated');
  assert(JSON.stringify(firstKeys) === JSON.stringify(secondKeys), 'signer - keys match');
}())