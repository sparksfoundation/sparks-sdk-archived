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

  console.log('keyPairs', keyPairs)

  let newKeys = await spark.generateKeyPairs({
    signing: { password, salt: keyPairs.signing.salt },
    encryption: { password, salt: keyPairs.encryption.salt },
  });

  console.log('newKeys', newKeys)

}())
