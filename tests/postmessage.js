import { Spark } from '../dist/index.mjs';
import { Ed25519 } from '../dist/signers/Ed25519/index.mjs';
import { Blake3 } from '../dist/hashers/Blake3/index.mjs';
import { Basic } from '../dist/controllers/Basic/index.mjs';
import { X25519SalsaPoly } from '../dist/ciphers/X25519SalsaPoly/index.mjs';
import { PostMessage } from '../dist/channels/ChannelTransports/PostMessage.mjs';
import { assert } from 'console';
import { Window } from './utilities/Window.js';

(async function () {
    const webWindow = new Window('http://localhost:1111');
    const aliceWindow = new Window('http://localhost:0000');

    const website = new Spark({
        cipher: X25519SalsaPoly,
        controller: Basic,
        hasher: Blake3,
        signer: Ed25519,
    });
    
    const keyPairs = await website._generateKeyPairs();
    await website.incept(keyPairs)

    const alice = new Spark({
        cipher: X25519SalsaPoly,
        controller: Basic,
        hasher: Blake3,
        signer: Ed25519,
    });

    await alice.incept()

    PostMessage.receive(async ({ event, confirmOpen }) => {
        const channel = await confirmOpen();
        channel.on([channel.eventTypes.ANY_EVENT], async (event) => {
            if (event.type.endsWith('ERROR')) { console.log(event) }
        });

        await channel.message('hey');

    }, { spark: website, _window: webWindow });

    const channel = new PostMessage({
        peer: { origin: 'http://localhost:1111' },
        spark: alice,
        _window: aliceWindow,
    });

    channel.on([channel.eventTypes.ANY_EVENT], async (event) => {
        if (event.type.endsWith('ERROR')) { console.log(event) }
    });
    
    await channel.open()
    await channel.message('hey');
    await channel.message('hey');
    await channel.message('hey');
    await channel.message('hey');

    // const test = await website.export();

    // const newLogin = new Spark({
    //     cipher: X25519SalsaPoly,
    //     controller: Basic,
    //     hasher: Blake3,
    //     signer: Ed25519,
    // });

    // await newLogin.import({
    //     data: test,
    //     ...keyPairs,
    // });

}())