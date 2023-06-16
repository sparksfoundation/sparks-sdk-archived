import { Spark, Blake3, Random, Ed25519, X25519SalsaPoly, Fetch } from '../dist/index.mjs';
import fetch  from 'node-fetch';
global.fetch = fetch;

const client = new Spark({ 
  controller: Random, 
  signer: Ed25519, 
  hasher: Blake3, 
  cipher: X25519SalsaPoly, 
  channels: [Fetch] 
});
await client.controller.incept();

const channel = new client.channels.Fetch({ 
  url: 'http://127.0.0.1:3400/channel',
})

await channel.open()
setInterval(async () => {
  const receipt = await channel.send({ test: 'secret message' })
  console.log(channel.channelId)
}, 5000);