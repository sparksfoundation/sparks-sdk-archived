import { Spark } from '../dist/index.mjs';
import { Blake3 } from '../dist/hashers/Blake3/Blake3.mjs';
import { Ed25519Password } from '../dist/signers/Ed25519/index.mjs';
import { X25519SalsaPolyPassword } from '../dist/ciphers/X25519SalsaPoly/index.mjs';
import { Basic } from '../dist/controllers/Basic/index.mjs';

(async function () {
  const spark = new Spark({
    cipher: X25519SalsaPolyPassword,
    controller: Basic,
    hasher: Blake3,
    signer: Ed25519Password,
  });

  const password = 'password';
  let keyPairs = await spark.generateKeyPairs({ password })
  await spark.setKeyPairs(keyPairs);
  const data = await spark.export();

  let newKeys = await spark.generateKeyPairs({
    signer: { password, salt: keyPairs.signer.salt },
    cipher: { password, salt: keyPairs.cipher.salt },
  });

  const test = new Spark({
    cipher: X25519SalsaPolyPassword,
    controller: Basic,
    hasher: Blake3,
    signer: Ed25519Password,
  });

  const keys = await test.generateKeyPairs({
    signer: { password, salt: keyPairs.signer.salt },
    cipher: { password, salt: keyPairs.cipher.salt },
  });

  await test.setKeyPairs(keys);
  await test.import(data);

}())
