/*
class PostMessageChannel {
  #keyPairs: any;
  #sharedKey: string;
  #listeners: Map<Function, Function>;
  #encrypt: Function;
  #decrypt: Function;
  #sign: Function;
  #verify: Function;
  #computeSharedKey: Function
  target: Window;
  origin: string;
  publicKeys: any;

  constructor({ keyPairs, encrypt, decrypt, sign, verify, computeSharedKey }) {
    this.#keyPairs = keyPairs;
    this.#encrypt = encrypt;
    this.#decrypt = decrypt;
    this.#sign = sign;
    this.#verify = verify;
    this.#computeSharedKey = computeSharedKey;
    this.#listeners = new Map();
    window.addEventListener('beforeunload', async () => {
      await this.disconnect()
    })
  }

  accept({ url }) {
    return new Promise((resolve, reject) => {
      const origin = new URL(url).origin;

      const handler = (event) => {
        if (event.data.type !== 'connectionRequest') return;
        if (event.origin !== origin) return;
        if (!event.data.publicKeys) return;

        event.source.postMessage({
          type: 'connectionConfirmation',
          publicKeys: {
            signing: this.#keyPairs.signing.publicKey,
            encryption: this.#keyPairs.encryption.publicKey,
          }
        }, event.origin);

        this.target = window.opener;
        this.origin = event.origin;
        this.publicKeys = event.data.publicKeys;
        this.#sharedKey = this.#computeSharedKey({ publicKey: this.publicKeys.encryption });
        this.target.postMessage({ type: 'connected' }, this.origin);
        window.removeEventListener('message', handler);
        resolve(this);
      }
      window.addEventListener('message', handler);
    })
  }

  connect({ url }) {
    return new Promise((resolve, reject) => {
      const origin = new URL(url).origin;
      const target = window.open(url, origin);
      if (!target) return reject(new Error('Failed to open window'));

      const interval = setInterval(() => {
        target.postMessage({
          type: 'connectionRequest',
          publicKeys: {
            signing: this.#keyPairs.signing.publicKey,
            encryption: this.#keyPairs.encryption.publicKey,
          }
        }, origin);
      }, 1000);

      const handler = (event) => {
        if (event.origin !== origin) return;
        if (event.data.type !== 'connectionConfirmation') return;
        if (!event.data.publicKeys) return;

        this.target = target;
        this.origin = origin;
        this.publicKeys = event.data.publicKeys;
        this.#sharedKey = this.#computeSharedKey({ keyPairs: this.#keyPairs, publicKey: this.publicKeys.encryption });
        this.target.postMessage({ type: 'connected' }, this.origin);
        window.removeEventListener('message', handler);
        clearInterval(interval);
        resolve(this);
      }
      window.addEventListener('message', handler);
    })
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      const handleDisconnect = (event) => {
        if (
          event.source === this.target &&
          event.origin === this.origin &&
          event.data === 'disconnectConfirmation'
        ) {
          window.removeEventListener('message', handleDisconnect);
          resolve(true);
        }
      };
      this.target.postMessage({ type: 'disconnected' }, this.origin);
      window.addEventListener('message', handleDisconnect);
    });
  }

  send(data) {
    if (!this.target) throw new Error('not connected yet');
    const ciphertext = this.#encrypt({ data, sharedKey: this.#sharedKey });
    const signature = this.#sign({ data: ciphertext, detached: true });

    return new Promise((resolve, reject) => {
      const handleMessage = (event) => {
        if (
          event.source === this.target &&
          event.origin === this.origin &&
          event.data === 'messageConfirmation'
        ) {
          window.removeEventListener('message', handleMessage);
          resolve(true);
        }
      };
      window.addEventListener('message', handleMessage);
      this.target.postMessage({ type: 'message', message: { ciphertext, signature } }, this.origin);
    });
  }

  on(eventType, callback) {
    const allowed = ['message', 'disconnected', 'connected']
    if (!allowed.includes(eventType)) return;

    const listener = (event) => {
      if (
        event.source === this.target &&
        event.origin === this.origin &&
        event.data?.type === eventType
      ) {
        if (event.data?.type !== 'message') {
          return callback(event.data.message)
        }
        const { signature, ciphertext } = event.data.message;
        const verified = this.#verify({ data: ciphertext, signature, publicKey: this.publicKeys.signing });
        if (!verified) return;
        const message = this.#decrypt({ data: ciphertext, sharedKey: this.#sharedKey });
        callback(message);
      }
    };
    this.#listeners.set(callback, listener);
    window.addEventListener('message', listener);
  }
}

export default Base => class PostMessage extends Base {
  constructor(...args) {
    super(...args)
    this.channels = []
  }

  postMessage() {
    const channel = new PostMessageChannel({
      keyPairs: this.keyPairs,
      encrypt: this.encrypt.bind(this),
      decrypt: this.decrypt.bind(this),
      sign: this.sign.bind(this),
      verify: this.verify.bind(this),
      computeSharedKey: this.sharedKey.bind(this),
    })

    this.channels.push(channel)
    return channel
  }
}

*/

import nacl from "tweetnacl";
import util from "tweetnacl-util";

export default Base => {

  /**
   * sets urls that user is willing to accept connections from
   * once a connection comes in it's added to the collection and emits connection event
   * @param function before - function to run before connection is accepted returns boolean true to accept connection, false to reject
   * @returns {Promise<Channel>}
  */

  /*
    alice opens bob
    bob sends keys to alice
    bob waits for alice to receive keys
    alice sends confirmation she's setup
    bob receives confirmation
    bob sends confirmation he's setup
    bob and alice both get callbacks
  */

  function allow(this: typeof Base, { beforeOpen, onOpen, onClose, onMessage }: { beforeOpen?: Function, onOpen?: Function, onClose?: Function, onMessage?: Function }) {
    const handler = (event) => {
      const { data: { cid, type, publicKeys }, origin, source } = event;
      if (!cid || !publicKeys || !type || !origin || !source) return;
      if (type !== 'sparks-channel:connection-request') return;

      const options = {
        cid: cid,
        origin: origin,
        target: window.opener,
        publicKeys: publicKeys,
        sharedKey: undefined,
      }

      if (beforeOpen && !beforeOpen(options)) return;

      options.sharedKey = this.sharedKey({ publicKey: publicKeys.encryption });
      const connection = new PostMessageChannel({ ...options, identity: this, onOpen, onClose, onMessage });
      this.postMessage.channels.push(connection);

      source.postMessage({
        type: 'sparks-channel:connection-confirmation',
        cid: cid,
        publicKeys: {
          signing: this.keyPairs.signing.publicKey,
          encryption: this.keyPairs.encryption.publicKey,
        }
      }, origin);

      window.removeEventListener('message', handler);
      if (onOpen) onOpen(connection);
    }

    window.addEventListener('message', handler);
  }

  /**
   * connects to a url and emits connection event
  */
  function open(this: typeof Base, { url, beforeOpen, onOpen, onClose, onMessage }: { url: string, beforeOpen?: Function, onOpen?: Function, onClose?: Function, onMessage?: Function }) {
    const origin = new URL(url).origin;
    const target = window.open(url, '_blank');
    if (!target) return;

    const cid = util.encodeBase64(nacl.randomBytes(16));
    const interval = setInterval(() => {
      target.postMessage({
        type: 'sparks-channel:connection-request',
        cid: cid,
        publicKeys: {
          signing: this.keyPairs.signing.publicKey,
          encryption: this.keyPairs.encryption.publicKey,
        }
      }, origin);
    }, 1000);

    const handler = (event) => {
      const { data: { cid, type, publicKeys }, origin } = event;
      if (!cid || !publicKeys || !type || !origin) return;
      if (type !== 'sparks-channel:connection-confirmation') return;
      const options = {
        cid: cid,
        origin: origin,
        target: target,
        publicKeys: publicKeys,
        sharedKey: undefined as string | undefined,
      }

      if (beforeOpen && !beforeOpen(options)) return;
      options.sharedKey = this.sharedKey({ publicKey: publicKeys.encryption });
      if (!options.sharedKey) throw new Error('Failed to compute shared key');

      const connection = new PostMessageChannel({ ...options, identity: this, onOpen, onClose, onMessage });
      this.postMessage.channels.push(connection);
      window.removeEventListener('message', handler);
      clearInterval(interval);
      if (onOpen) onOpen(connection);
    }

    window.addEventListener('message', handler);
  }

  function close(this: typeof Base) {
    this.channels.forEach(channel => channel.disconnect())
    this.channels = []
  }

  class PostMessageChannel {
    cid: string;
    origin: string;
    target: Window;
    publicKeys: any;
    sharedKey: string;
    identity: typeof Base;
    onOpen: Function | undefined;
    onClose: Function | undefined;
    onMessage: Function | undefined;

    constructor({ cid, identity, origin, target, publicKeys, sharedKey, onOpen, onClose, onMessage }: { cid: string, identity: typeof Base, origin: string, target: Window, publicKeys: any, sharedKey?: string, onOpen?: Function, onClose?: Function, onMessage?: Function }) {
      if (!cid || !identity || !origin || !target || !publicKeys || !sharedKey) {
        throw new Error('missing required params')
      }
      this.cid = cid
      this.identity = identity
      this.origin = origin
      this.target = target
      this.publicKeys = publicKeys
      this.sharedKey = sharedKey
      this.onOpen = onOpen
      this.onClose = onClose
      this.onMessage = onMessage ? (data) => {
        console.log(this)
        const { cid, mid, signature, ciphertext } = data;
        const verified = this.identity.verify({ data: ciphertext, signature, publicKey: this.publicKeys.signing });
        if (!verified) return;
        const message = this.identity.decrypt({ data: ciphertext, sharedKey: this.sharedKey });
        const signed = this.identity.sign({ data: { cid, message } })
        this.target.postMessage({ cid, mid, signature: signed, type: 'sparks-channel:message-confirmation' }, this.origin)
        onMessage(message);
      } : undefined
    }

    async message(data) {
      const mid = util.encodeBase64(nacl.randomBytes(16));
      const ciphertext = this.identity.encrypt({ data, sharedKey: this.sharedKey });
      const signature = this.identity.sign({ data: ciphertext, detached: true });
      return new Promise((resolve, reject) => {
        const handler = (event) => {
          const { data, source, origin } = event;
          if (
            data.mid === mid &&
            source === this.target &&
            origin === this.origin &&
            data.type === 'sparks-channel:message-confirmation'
          ) {
            window.removeEventListener('message', handler);
            resolve(data.signature);
          }
        };
        window.addEventListener('message', handler);
        this.target.postMessage({ cid: this.cid, mid: mid, type: 'sparks-channel:message', ciphertext, signature }, this.origin);
      });
    }

    async close() {
      return new Promise((resolve, reject) => {
        const handleDisconnect = (event) => {
          if (
            event.source === this.target &&
            event.origin === this.origin &&
            event.data === 'sparks-channel:closed-confirmation'
          ) {
            window.removeEventListener('message', handleDisconnect);
            resolve(true);
          }
        };
        this.target.postMessage({ cid: this.cid, type: 'sparks-channel:closed' }, this.origin);
        window.addEventListener('message', handleDisconnect);
      });
    }
  }

  class PostMessage extends Base {
    constructor(...args) {
      super(...args)
      this.postMessage = {
        channels: [],
        open: open.bind(this),
        allow: allow.bind(this),
        close: close.bind(this),
      }

      const handler = (event) => {
        const { data, origin } = event;
        const { cid, type } = data;
        if (!cid || !type || !origin) return;
        if (type.indexOf('sparks-channel') !== 0) return;
        const channel = this.postMessage.channels.find(channel => channel.cid === cid);
        if (!channel) return;
        if (type === 'sparks-channel:closed') channel.onClose(cid)
        if (type === 'sparks-channel:opened') channel.onOpen(cid)
        if (type === 'sparks-channel:message') channel.onMessage(data)
      };

      window.addEventListener('message', handler);
      window.addEventListener('beforeunload', async () => {
        this.postMessage.channels.forEach(channel => channel.close())
        this.postMessage.channels = []
      });
    }
  }

  return PostMessage
}
