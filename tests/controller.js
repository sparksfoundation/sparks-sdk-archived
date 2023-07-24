import { Spark } from '../dist/index.js';
import { Ed25519Password } from '../dist/signers/Ed25519Password/index.js';
import { X25519SalsaPolyPassword } from '../dist/ciphers/X25519SalsaPolyPassword/index.js';
import { Blake3 } from '../dist/hashers/Blake3/index.js';
import { Basic } from '../dist/controllers/Basic/index.js';
import { assert } from 'console';
import util from 'tweetnacl-util';
import nacl from 'tweetnacl';

(async function () {
  const spark = new Spark({
    cipher: X25519SalsaPolyPassword,
    controller: Basic,
    hasher: Blake3,
    signer: Ed25519Password,
  });

  const salt = util.encodeBase64(nacl.randomBytes(16));
  const password = 'password';

  await spark.incept({
    signer: { password, salt },
    cipher: { password, salt },
  })
    .catch(e => { console.log(e); assert(false, 'controller - incepted'); });

  await spark.rotate({
    signer: { password, salt },
    cipher: { password, salt },
  })
    .catch(e => { console.log(e); assert(false, 'controller - rotated 1'); });

  await spark.rotate({
    signer: { password, salt },
    cipher: { password, salt },
  })
    .catch(e => { console.log(e); assert(false, 'controller - rotated 2'); });

  await spark.destroy()
    .catch(e => { console.log(e); assert(false, 'controller - destroyed'); });
}())
