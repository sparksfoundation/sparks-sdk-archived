import { SparkError } from '../dist/errors/index.mjs';
import { Spark } from '../dist/index.mjs';
import { Ed25519 } from '../dist/signers/Ed25519/index.mjs';

const spark = new Spark({
  cipher: Ed25519,
  hasher: Ed25519,
  signer: Ed25519,
});

async function test() {
  await spark.initSingingKeys();
  const keys = spark.signingKeys();
  const data = { test: 'test' };
  const signed = await spark.sign(data);
  const verified = await spark.verify({ data, signature: signed, publicKey: keys.publicKey });

  const sealed = await spark.seal(data);
  const opened = await spark.open({ publicKey: keys.publicKey, signature: sealed });

  console.log('keys generated:', !(keys instanceof SparkError));
  console.log('data signed:', !(signed instanceof SparkError));
  console.log('data verified:', !(verified instanceof SparkError));
  console.log('data sealed:', !(sealed instanceof SparkError));
  console.log('data opened:', !(opened instanceof SparkError));
}

test();