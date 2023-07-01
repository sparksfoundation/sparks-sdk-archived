import { Spark } from '../dist/index.mjs';
import { Ed25519 } from '../dist/signers/Ed25519/index.mjs';
import { Blake3 } from '../dist/hashers/Blake3/index.mjs';
import { Basic } from '../dist/controllers/Basic/index.mjs';
import { X25519SalsaPoly } from '../dist/ciphers/X25519SalsaPoly/index.mjs';
import { PostMessage } from '../dist/channels/PostMessage/index.mjs';
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
    website.setKeyPairs(websiteKeys)
    await website.incept(websiteKeys)

    const alice = new Spark({
        cipher: X25519SalsaPoly,
        controller: Basic,
        hasher: Blake3,
        signer: Ed25519,
    });
    const aliceKeys = await alice.generateKeyPairs()
    await alice.incept(aliceKeys)

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
        origin: 'http://localhost:1111',
        _window: _0000,
        spark: alice,
    });

    await channel.open();
    await channel.message('hey');
    const cid = channel.cid;
    await channel.close();

    const eventLog = [ ...channel.eventLog ];

    const test = new PostMessage({
        origin: 'http://localhost:1111',
        source: _1111,
        _window: _0000,
        spark: alice,
        cid: cid,
        eventLog: [ ...eventLog ],
    });

    await test.open();
    await test.message('hey');
}())