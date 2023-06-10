import { CastingAgent, X25519SalsaPoly, Ed25519, Blake3, Random, PostMessage } from '../dist/index.js';
import MockWindow from './mocks/MockWindow.js';

const CommsAgent = CastingAgent({
  encrypt: X25519SalsaPoly,
  sign: Ed25519,
  hash: Blake3,
  derive: Random,
  channels: [PostMessage],
});

// mock window to test channel
global.window = new MockWindow('http://localhost:3000');

const website = new CommsAgent();
website.incept();

// website accepts alice's connection request
website.postMessage.open({
  onOpen: (id, conn) => {
    console.log('Website connected')
    setTimeout(() => {
      conn.message('Website')
    }, 60)
  },
  onMessage: (data, conn) => {
    console.log(`Hi from Website: ${data}!`)
  },
  onClose: (id, conn) => {
    console.log('closed from Website', id)
  },
})

const alice = new CommsAgent();
alice.incept();

alice.postMessage.open({
  url: 'http://localhost:3000',
  onOpen: (id, conn) => {
    console.log('Alice connected')
    conn.message('Alice').then((signature) => {
      const data = alice.verify({ signature, publicKey: conn.publicKeys.signing })
      const verified = data.cid === conn.cid && data.message === 'Alice'
      console.log(`message verified:`, verified)
      conn.close()
    })
  },
  onClose: (id, conn) => {
    console.log('closed from Alice', id)
  },
  onMessage: (data, conn) => {
    console.log(`Hi from Alice: ${data}!`)
  }
})