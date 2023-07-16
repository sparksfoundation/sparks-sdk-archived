import { Spark } from '../dist/index.mjs';
import { Ed25519 } from '../dist/signers/Ed25519/index.mjs';
import { X25519SalsaPoly } from '../dist/ciphers/X25519SalsaPoly/index.mjs';
import { Blake3 } from '../dist/hashers/Blake3/index.mjs';
import { Basic } from '../dist/controllers/Basic/index.mjs';
import { HttpFetch } from '../dist/channels/ChannelTransports/HttpFetch/index.mjs';
import { assert } from 'console';

import fetch from 'node-fetch';
global.fetch = fetch;

(async function () {
    try {
        const channels = [];
        const max_users = 1;
        for (let i = 0; i < max_users; i++) {
            const client = new Spark({
                cipher: X25519SalsaPoly,
                controller: Basic,
                hasher: Blake3,
                signer: Ed25519,
            });
            await client.incept()
    
            const channel = new HttpFetch({
                peer: { url: 'http://127.0.0.1:3400/restAPI' },
                spark: client,
            });

            await channel.open();
            console.log('user', (i + 1), 'connected');
            channel.on('MESSAGE_CONFIRM', async (event) => {
              const data = await channel.openEvent(event);
              console.log(data.data);
            });
            channels.push(channel);
        }
    
        const delay = 1;
        const max_messages = 100;
        let i = 0;
        const start = performance.now();
        while (i < max_messages) {
            // send a message from each channel
            for(let channel of channels) {
                await channel.message('msg: ' + Math.random().toString(36).substring(2, 8))
                    .catch(error => console.error(error));
                //await new Promise(resolve => setTimeout(resolve, delay));
                i += 1;
                if (i >= max_messages) break;
            }
        }
        
        const end = performance.now();
        const seconds = (end - start) / 1000;
        const messages_per_second = (max_messages * channels.length) / seconds;
        console.log('messages per second:', messages_per_second);
        console.log('total time:', seconds, 'seconds');

    } catch (error) {
        console.error(error);
        process.exit(0);
    }
}())
