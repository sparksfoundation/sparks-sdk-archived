import { Spark } from '../dist/index.mjs';
import { Ed25519 } from '../dist/signer/Ed25519/index.mjs';
import { X25519SalsaPoly } from '../dist/cipher/X25519SalsaPoly/index.mjs';
import { SparkError } from '../dist/common/errors.mjs';
import { Blake3 } from '../dist/hasher/Blake3/index.mjs';
import { Basic } from '../dist/controller/Basic/index.mjs';
import { assert } from 'console';

(async function() {
  const spark = new Spark({
    cipher: X25519SalsaPoly,
    controller: Basic,
    hasher: Blake3,
    signer: Ed25519,
  });

  const data = { test: 'test' };
  const keyPairs = await spark.generateKeyPairs(); 
  spark.setKeyPairs({ keyPairs});
  const keys = spark.keyPairs;
  
  const other = await spark.generateKeyPairs();

  const signed = await spark.sign({data});
  const verified = await spark.verify({ data, signature: signed, publicKey: keys.signing.publicKey });

  const sealed = await spark.seal({data});
  const opened = await spark.open({ publicKey: keys.signing.publicKey, signature: sealed });

  assert(!(keys instanceof SparkError), 'signer - keys generated');
  assert(!(other instanceof SparkError), 'signer - other keys generated');

  assert(!(signed instanceof SparkError), 'signer - data signed');
  assert(!(verified instanceof SparkError), 'signer - data verified');

  assert(!(sealed instanceof SparkError), 'signer - data sealed');
  assert(!(opened instanceof SparkError), 'signer - data opened');
}())