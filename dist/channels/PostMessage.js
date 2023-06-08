import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

var PostMessage_default = (Base) => {
  function allow(mixin, { beforeOpen, onOpen, onClose, onMessage }) {
    const handler = (event) => {
      const { data: { cid, type, publicKeys }, origin, source } = event;
      if (!cid || !publicKeys || !type || !origin || !source)
        return;
      if (type !== "sparks-channel:connection-request")
        return;
      const options = {
        cid,
        origin,
        target: window.opener,
        publicKeys,
        sharedKey: void 0
      };
      if (beforeOpen && !beforeOpen(options))
        return;
      options.sharedKey = mixin.sharedKey({ publicKey: publicKeys.encryption });
      const connection = new PostMessageChannel({ ...options, identity: mixin, onOpen, onClose, onMessage });
      mixin.postMessage.channels.push(connection);
      if (onOpen)
        onOpen(connection);
      source.postMessage({
        // change the below to be messageType
        type: "sparks-channel:connection-confirmation",
        cid,
        publicKeys: {
          signing: mixin.keyPairs.signing.publicKey,
          encryption: mixin.keyPairs.encryption.publicKey
        }
      }, origin);
      window.removeEventListener("message", handler);
    };
    window.addEventListener("message", handler);
  }
  function open(mixin, { url, beforeOpen, onOpen, onClose, onMessage }) {
    const origin = new URL(url).origin;
    const target = window.open(url, "_blank");
    if (!target)
      return;
    const cid = util.encodeBase64(nacl.randomBytes(16));
    const interval = setInterval(() => {
      target.postMessage({
        type: "sparks-channel:connection-request",
        cid,
        publicKeys: {
          signing: mixin.keyPairs.signing.publicKey,
          encryption: mixin.keyPairs.encryption.publicKey
        }
      }, origin);
    }, 1e3);
    const handler = (event) => {
      const { data: { cid: cid2, type, publicKeys }, origin: origin2 } = event;
      if (!cid2 || !publicKeys || !type || !origin2)
        return;
      if (type !== "sparks-channel:connection-confirmation")
        return;
      const options = {
        cid: cid2,
        origin: origin2,
        target,
        publicKeys,
        sharedKey: void 0
      };
      if (beforeOpen && !beforeOpen(options))
        return;
      options.sharedKey = mixin.sharedKey({ publicKey: publicKeys.encryption });
      if (!options.sharedKey)
        throw new Error("Failed to compute shared key");
      const connection = new PostMessageChannel({ ...options, identity: mixin, onOpen, onClose, onMessage });
      mixin.postMessage.channels.push(connection);
      window.removeEventListener("message", handler);
      clearInterval(interval);
      if (onOpen)
        onOpen(connection);
    };
    window.addEventListener("message", handler);
  }
  function close(mixin) {
    mixin.channels.forEach((channel) => channel.disconnect());
    mixin.channels = [];
  }
  class PostMessageChannel {
    cid;
    origin;
    target;
    publicKeys;
    sharedKey;
    identity;
    onOpen;
    onClose;
    onMessage;
    constructor({ cid, identity, origin, target, publicKeys, sharedKey, onOpen, onClose, onMessage }) {
      if (!cid || !identity || !origin || !target || !publicKeys || !sharedKey) {
        throw new Error("missing required params");
      }
      this.cid = cid;
      this.identity = identity;
      this.origin = origin;
      this.target = target;
      this.publicKeys = publicKeys;
      this.sharedKey = sharedKey;
      this.onOpen = onOpen;
      this.onClose = onClose;
      this.onMessage = onMessage ? (data) => {
        const { cid: cid2, mid, signature, ciphertext } = data;
        const verified = this.identity.verify({ data: ciphertext, signature, publicKey: this.publicKeys.signing });
        if (!verified)
          return;
        const message = this.identity.decrypt({ data: ciphertext, sharedKey: this.sharedKey });
        const signed = this.identity.sign({ data: { cid: cid2, message } });
        this.target.postMessage({ cid: cid2, mid, signature: signed, type: "sparks-channel:message-confirmation" }, this.origin);
        onMessage(message);
      } : void 0;
    }
    async message(data) {
      const mid = util.encodeBase64(nacl.randomBytes(16));
      const ciphertext = this.identity.encrypt({ data, sharedKey: this.sharedKey });
      const signature = this.identity.sign({ data: ciphertext, detached: true });
      return new Promise((resolve, reject) => {
        const handler = (event) => {
          const { data: data2, source, origin } = event;
          if (data2.mid === mid && source === this.target && origin === this.origin && data2.type === "sparks-channel:message-confirmation") {
            window.removeEventListener("message", handler);
            resolve(data2.signature);
          }
        };
        window.addEventListener("message", handler);
        this.target.postMessage({ cid: this.cid, mid, type: "sparks-channel:message", ciphertext, signature }, this.origin);
      });
    }
    async close() {
      return new Promise((resolve, reject) => {
        const handleDisconnect = (event) => {
          if (event.source === this.target && event.origin === this.origin && event.data === "sparks-channel:closed-confirmation") {
            window.removeEventListener("message", handleDisconnect);
            resolve(true);
          }
        };
        this.target.postMessage({ cid: this.cid, type: "sparks-channel:closed" }, this.origin);
        window.addEventListener("message", handleDisconnect);
      });
    }
  }
  class PostMessage extends Base {
    constructor(...args) {
      super(...args);
      this.postMessage = {
        channels: [],
        open: open.bind(this),
        allow: allow.bind(this),
        close: close.bind(this)
      };
      const handler = (event) => {
        const { data, origin } = event;
        const { cid, type } = data;
        if (!cid || !type || !origin)
          return;
        if (type.indexOf("sparks-channel") !== 0)
          return;
        const channel = this.postMessage.channels.find((channel2) => channel2.cid === cid);
        if (!channel)
          return;
        if (type === "sparks-channel:closed")
          channel.onClose(cid);
        if (type === "sparks-channel:opened")
          channel.onOpen(cid);
        if (type === "sparks-channel:message")
          channel.onMessage(data);
      };
      window.addEventListener("message", handler);
      window.addEventListener("beforeunload", async () => {
        this.postMessage.channels.forEach((channel) => channel.close());
        this.postMessage.channels = [];
      });
    }
  }
  return PostMessage;
};

export { PostMessage_default as default };
