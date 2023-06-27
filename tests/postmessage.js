import { Spark } from '../dist/index.mjs';
import { Ed25519 } from '../dist/signer/Ed25519/index.mjs';
import { Blake3 } from '../dist/hasher/Blake3/index.mjs';
import { Basic } from '../dist/controller/Basic/index.mjs';
import { X25519SalsaPoly } from '../dist/cipher/X25519SalsaPoly/index.mjs';
import { PostMessage } from '../dist/channel/PostMessage/index.mjs';
import { assert } from 'console';
import { _0000, _1111 } from './utilities/MockWindow.js';

(async function () {
    const website = new Spark({
        cipher: X25519SalsaPoly,
        controller: Basic,
        hasher: Blake3,
        signer: Ed25519,
    });
    const websiteKeys = await website.generateKeyPairs()
    website.setKeyPairs({ keyPairs: websiteKeys })
    await website.incept()

    const alice = new Spark({
        cipher: X25519SalsaPoly,
        controller: Basic,
        hasher: Blake3,
        signer: Ed25519,
    });
    const aliceKeys = await alice.generateKeyPairs()
    alice.setKeyPairs({ keyPairs: aliceKeys })
    await alice.incept()


    PostMessage.handleOpenRequests(async ({ event, resolve, reject }) => {
        const channel = await resolve()

        channel.onclose = event => {
            console.log('closed');
        }

        channel.onmessage = event => {
            console.log('message:', event.data);
        }
    }, { spark: website, _window: _1111 });

    const channel = new PostMessage({
        source: _1111,
        origin: 'http://localhost:1111',
        _window: _0000,
        spark: alice,
    });

    const test = await channel.open()

    await channel.close()

    const receipt = await channel.message('hey')
}())