import { Spark } from '../dist/index.mjs';
import { Blake3 } from '../dist/hasher/Blake3/Blake3.mjs';
import { Ed25519 } from '../dist/signer/Ed25519/index.mjs';
import { X25519SalsaPoly } from '../dist/cipher/X25519SalsaPoly/index.mjs';
import { SparkError } from '../dist/common/errors.mjs';
import { Basic } from '../dist/controller/Basic/index.mjs';
import { assert } from 'console';

(async function() {
  const spark = new Spark({
    cipher: X25519SalsaPoly,
    controller: Basic,
    hasher: Blake3,
    signer: Ed25519,
  });

  let keyPairs = await spark.generateKeyPairs();
  let nextKeyPairs = await spark.generateKeyPairs();
  spark.setKeyPairs({ keyPairs });

  const incept = await spark.incept({ keyPairs });
  assert(!(incept instanceof SparkError) && spark.keyEventLog.length === 1 && spark.keyEventLog[0].type === 'INCEPT', 'controller - incepted');
  
  spark.setKeyPairs({ keyPairs });
  nextKeyPairs = await spark.generateKeyPairs();
  const rotate1 = await spark.rotate({ nextKeyPairs });
  assert(!(rotate1 instanceof SparkError) && spark.keyEventLog.length === 2 && spark.keyEventLog[1].type === 'ROTATE', 'controller - rotated 1');

  spark.setKeyPairs({ keyPairs: nextKeyPairs });
  keyPairs = { ...nextKeyPairs };
  nextKeyPairs = await spark.generateKeyPairs();
  const rotate2 = await spark.rotate({ nextKeyPairs });
  assert(!(rotate2 instanceof SparkError) && spark.keyEventLog.length === 3 && spark.keyEventLog[2].type === 'ROTATE', 'controller - rotated 2');

  const destroy = await spark.destroy();
  assert(!(destroy instanceof SparkError) && spark.keyEventLog.length === 4 && spark.keyEventLog[3].type === 'DESTROY', 'controller - destroyed');
}())
