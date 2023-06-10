import nacl from "tweetnacl";
import util from "tweetnacl-util";

class PostMessageChannel {
  cid: string;
  ctx: any; // todo - type this
  origin: string;
  target: Window;
  publicKeys: any;
  sharedKey: string;
  onOpen: Function | undefined;
  onClose: Function | undefined;
  onMessage: Function | undefined;
  closed: boolean = false

  constructor({
    cid,
    origin,
    target,
    publicKeys,
    sharedKey,
    onOpen,
    onMessage,
    onClose,
    encrypt,
    decrypt,
    sign,
    verify,
  }: {
    cid: string,
    origin: string,
    target: Window,
    publicKeys: any,
    sharedKey?: string,
    onOpen?: Function,
    onMessage?: Function,
    onClose?: Function,
    encrypt: Function,
    decrypt: Function,
    sign: Function,
    verify: Function
  }) {
    if (!cid || !origin || !target || !publicKeys || !sharedKey || !encrypt || !decrypt || !sign || !verify) {
      throw new Error('missing required params')
    }

    this.ctx = { encrypt, decrypt, sign, verify }
    this.cid = cid
    this.origin = origin
    this.target = target
    this.publicKeys = publicKeys
    this.sharedKey = sharedKey
    this.onOpen = onOpen
    this.onClose = onClose
    this.closed = false

    const messageHandler = onMessage ? (data, conn) => {
      const { cid, mid, signature, ciphertext } = data;
      const verified = this.ctx.verify({ data: ciphertext, signature, publicKey: this.publicKeys.signing });
      if (!verified) return;
      const message = this.ctx.decrypt({ data: ciphertext, sharedKey: this.sharedKey });
      const signed = this.ctx.sign({ data: { cid, message } });
      this.target.postMessage({ cid, mid, signature: signed, type: 'sparks-channel:message-confirmation' }, this.origin);
      if (!this.closed) onMessage(message, conn);
    } : undefined

    // todo -- either handle everything here or move it to the channel
    // channels should hanve their own global listeners tbh
    const handler = (event) => {
      const { data, origin } = event;
      const { cid, type } = data;
      if (!cid || !type || !origin) return;
      const isClosed = type === 'sparks-channel:closed';
      const isMessage = type === 'sparks-channel:message';
      if (isClosed && onClose) {
        onClose(cid, this)
      } else if (isMessage && messageHandler) {
        messageHandler(data, this)
      }
    };

    const close = this.close.bind(this)
    this.close = async () => {
      await close()
      window.removeEventListener('message', handler);
    }

    window.addEventListener('message', handler);
    window.addEventListener('beforeunload', close);
  }

  async message(data) {
    const mid = util.encodeBase64(nacl.randomBytes(16));
    const ciphertext = this.ctx.encrypt({ data, sharedKey: this.sharedKey });
    const signature = this.ctx.sign({ data: ciphertext, detached: true });

    return new Promise((resolve, reject) => {
      const handler = (event: { data: any; source: any; origin: any; }) => {
        const { data, source, origin } = event;
        if (
          data.mid === mid &&
          source === this.target &&
          origin === this.origin &&
          data.type === 'sparks-channel:message-confirmation'
        ) {
          if (this.closed) return reject('channel closed');
          else resolve(data.signature);
          window.removeEventListener('message', handler);
        }
      };
      this.target.postMessage({ cid: this.cid, mid: mid, type: 'sparks-channel:message', ciphertext, signature }, this.origin);
      window.addEventListener('message', handler);
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      const handleDisconnect = (event: { source: any; origin: string; data: string; }) => {
        if (
          event.source === this.target &&
          event.origin === this.origin &&
          event.data === 'sparks-channel:closed-confirmation'
        ) {
          window.removeEventListener('message', handleDisconnect);
          resolve(true);
        }
      };
      window.addEventListener('message', handleDisconnect);
      this.target.postMessage({ cid: this.cid, type: 'sparks-channel:closed' }, this.origin);
      this.closed = true
    });
  }
}

class PostMessageManager {
  channels: PostMessageChannel[];
  constructor(ctx) {
    this.channels = []
    // inject dependencies
    const open = this.open.bind(this)
    this.open = args => {
      open({
        ...args,
        publicKeys: ctx.publicKeys,
        encrypt: ctx.encrypt.bind(ctx),
        decrypt: ctx.decrypt.bind(ctx),
        sign: ctx.sign.bind(ctx),
        verify: ctx.verify.bind(ctx),
        computeSharedKey: ctx.computeSharedKey.bind(ctx),
      })
    }
  }

  async close() {
    this.channels.forEach((channel: { close: () => any; }) => channel.close())
    this.channels = []
  }

  open(args) {
    const { target, url } = args;
    const { beforeOpen, onOpen, onClose, onMessage } = args;
    const { computeSharedKey, publicKeys: ourPublicKeys } = args;
    const { encrypt, decrypt, sign, verify } = args;
    if (!computeSharedKey) throw new Error('computeSharedKey is required');
    const channelId = util.encodeBase64(nacl.randomBytes(16))
    let requestInterval

    // let's setup a handler to manage connection request or confirmation
    const handler = (event) => {
      const { data: { cid, type, publicKeys }, origin, source } = event;
      const confirming = type === 'sparks-channel:connection-confirmation';
      const requesting = type === 'sparks-channel:connection-request';

      if (confirming && !cid) return;                                                       // if we initiated and the channel id doesn't match return quietly
      if (!type || !origin || !(confirming || requesting)) return;                          // if missing options return quietly, we can't control inbound postMessages
      if (requesting && !source) throw new Error('Invalid source');                         // if they're requesting and there's no source throw
      if (requesting && !publicKeys) throw new Error('Missing public keys');                // if they're requesting but there's missing a prive key throw
      if (requesting && beforeOpen && !beforeOpen({ cid, origin, publicKeys })) return;     // let's process our beforeOpen callback to make sure it passes custom checks
      const sharedKey = computeSharedKey({ publicKey: publicKeys.encryption });

      // they're confirming we can setup the channel
      if (confirming) {
        if (!sharedKey) throw new Error('Failed to compute shared key');

        // let's setup the channel if it doesn't exist
        if (!this.channels.find(channel => channel.cid === cid)) {
          const channel = new PostMessageChannel({ cid, origin, target: source, publicKeys, sharedKey, onOpen, onMessage, onClose, encrypt, decrypt, sign, verify });
          this.channels.push(channel);
          if (onOpen) onOpen(cid, channel);
        }

        clearInterval(requestInterval);
        source.postMessage({ cid, type: 'sparks-channel:connection-confirmation', publicKeys: ourPublicKeys }, origin);
        window.removeEventListener('message', handler);

      } else if (requesting) {
        if (!sharedKey) throw new Error('Failed to compute shared key');
        // let's send a confirmation back to the source
        source.postMessage({
          type: 'sparks-channel:connection-confirmation',
          cid,
          publicKeys: ourPublicKeys,
        }, origin);

        // setup the requester's channel first
        const channel = new PostMessageChannel({ cid, origin, target: source, publicKeys, sharedKey, onOpen, onMessage, onClose, encrypt, decrypt, sign, verify });
        this.channels.push(channel);
        if (onOpen) onOpen(cid, channel);
      }
    }
    window.addEventListener('message', handler);

    // if has a target we can initiate the connection request
    // if the target is a string open a window
    if (!!url && typeof url === 'string') {
      const targetOrigin = new URL(url).origin;
      const targetWindow = target || window.open(url, '_blank');
      if (!targetWindow || !targetOrigin) throw new Error('Failed to open window');
      requestInterval = setInterval(() => {
        targetWindow.postMessage({
          type: 'sparks-channel:connection-request',
          cid: channelId,
          publicKeys: ourPublicKeys,
        }, origin);
      }, 1000);
    }
  }
}

const PostMessage = Base => class PostMessage extends Base {
  constructor(...args) {
    super(...args)
    this.postMessage = new PostMessageManager(this)
  }
}

PostMessage.type = 'channel'
PostMessage.dependencies = {
  encrypt: true,
  hash: true,
  sign: true,
}

export default PostMessage
