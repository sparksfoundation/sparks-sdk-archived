import { Spark } from '../dist/index.mjs';
import { Blake3 } from '../dist/hashers/Blake3/Blake3.mjs';
import { Ed25519Password } from '../dist/signers/Ed25519/index.mjs';
import { X25519SalsaPolyPassword } from '../dist/ciphers/X25519SalsaPoly/index.mjs';
import { Basic } from '../dist/controllers/Basic/index.mjs';
import { assert } from 'console';
import util from 'tweetnacl-util';
import nacl from 'tweetnacl';

(async function() {
    const spark = new Spark({
      cipher: X25519SalsaPolyPassword,
      controller: Basic,
      hasher: Blake3,
      signer: Ed25519Password,
    });

    await spark.incept({ password: 'password' });
    const keyPairs = spark.keyPairs;
    await spark.rotate({ password: 'password' });
    console.log(spark.keyPairs)
}())
