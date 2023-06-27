import { Spark } from '../dist/index.mjs';
import { Ed25519 } from '../dist/signer/Ed25519/index.mjs';
import { Blake3 } from '../dist/hasher/Blake3/index.mjs';
import { Basic } from '../dist/controller/Basic/index.mjs';
import { X25519SalsaPoly } from '../dist/cipher/X25519SalsaPoly/index.mjs';
import { PostMessage } from '../dist/channel/PostMessage/index.mjs';
import { assert } from 'console';
import cuid from 'cuid';
import { _0000, _1111 } from './utilities/MockWindow.js';

(async function () {

    const website = new Spark({
        cipher: X25519SalsaPoly,
        controller: Basic,
        hasher: Blake3,
        signer: Ed25519,
    });

    const websiteKeys = await website.generateKeyPairs()
        .catch(e => assert(false, 'signer - keys generated'));

    website.setKeyPairs({ keyPairs: websiteKeys })
        .catch(e => assert(false, 'signer - keys set'));

    await website.incept()
        .catch(e => assert(false, 'controller - incepted'));

    PostMessage.handleOpenRequests(async ({ event, resolve, reject }) => {
        const channel = await resolve()
            .catch(e => assert(false, 'channel - request accepted'));

        channel.onclose = event => {
        }

        channel.onmessage = event => {
            console.log(event);
        }

    }, { spark: website, _window: _1111 });


    const alice = new Spark({
        cipher: X25519SalsaPoly,
        controller: Basic,
        hasher: Blake3,
        signer: Ed25519,
    });

    const aliceKeys = await alice.generateKeyPairs()
        .catch(e => assert(false, 'signer - keys generated'));

    alice.setKeyPairs({ keyPairs: aliceKeys })
        .catch(e => assert(false, 'signer - keys set'));

    await alice.incept()
        .catch(e => assert(false, 'controller - incepted'));

    const channel = new PostMessage({
        source: _1111,
        origin: 'http://localhost:1111',
        _window: _0000,
        spark: alice,
    });

    channel.handleOpenAccepted = async ({ event, resolve, reject }) => {
        const channel = await resolve()
            .catch(e => assert(false, 'channel - request accepted'));
    };

    const test = await channel.open()
        .catch(e => { assert(false, 'channel - opened'); console.log(e) });

    await channel.close()

    const receipt = await channel.message('hey')
}())