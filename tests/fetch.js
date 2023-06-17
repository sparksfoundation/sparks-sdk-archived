import { Spark, Blake3, Random, Ed25519, X25519SalsaPoly, FetchAPI } from '../dist/index.mjs';
import fetch  from 'node-fetch';
global.fetch = fetch;

const client = new Spark({ 
  controller: Random, 
  signer: Ed25519, 
  hasher: Blake3, 
  cipher: X25519SalsaPoly, 
  channels: [FetchAPI] 
});
await client.controller.incept();

const channel = new client.channels.FetchAPI({ 
  url: 'http://127.0.0.1:3400/channels',
})

await channel.open()
setInterval(async () => {
  const receipt = await channel.send({ test: 'secret message' })
  console.log(receipt)
}, 5000);