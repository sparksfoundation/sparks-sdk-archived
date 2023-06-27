import { Spark } from '../dist/index.mjs';
import { Ed25519 } from '../dist/signer/Ed25519/index.mjs';
import { X25519SalsaPoly } from '../dist/cipher/X25519SalsaPoly/index.mjs';
import { Blake3 } from '../dist/hasher/Blake3/index.mjs';
import { Basic } from '../dist/controller/Basic/index.mjs';
import { FetchAPI } from '../dist/channel/Http/index.mjs';
import { assert } from 'console';

import fetch from 'node-fetch';
global.fetch = fetch;

(async function () {
    try {
        const channels = [];
        const max_users = 2;
        for (let i = 0; i < max_users; i++) {
            const client = new Spark({
                cipher: X25519SalsaPoly,
                controller: Basic,
                hasher: Blake3,
                signer: Ed25519,
            });
            const clientKeys = await client.generateKeyPairs()
            client.setKeyPairs({ keyPairs: clientKeys })
            await client.incept()
    
            const channel = new FetchAPI({
                url: 'http://127.0.0.1:3400/restAPI',
                spark: client,
            })
            await channel.open();
            console.log('user', (i + 1), 'connected');
            channels.push(channel);
        }
    
        // test by iterating over all sparks and sending a message from each
        // there should be a delay between each message
        const delay = 100;
        let i = 0;
        while (true) {
            const channel = channels[i++ % max_users];
            await channel.message(Math.random().toString(36).substring(2, 8));
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    } catch (error) {
        console.error(error);
        process.exit(0);
    }
}())
