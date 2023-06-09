'use strict';

var nacl = require('tweetnacl');
var util = require('tweetnacl-util');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var nacl__default = /*#__PURE__*/_interopDefault(nacl);
var util__default = /*#__PURE__*/_interopDefault(util);

class PostMessageChannel {
  cid;
  ctx;
  // todo - type this
  origin;
  target;
  publicKeys;
  sharedKey;
  onOpen;
  onClose;
  onMessage;
  closed = false;
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
    verify
  }) {
    if (!cid || !origin || !target || !publicKeys || !sharedKey || !encrypt || !decrypt || !sign || !verify) {
      throw new Error("missing required params");
    }
    this.ctx = { encrypt, decrypt, sign, verify };
    this.cid = cid;
    this.origin = origin;
    this.target = target;
    this.publicKeys = publicKeys;
    this.sharedKey = sharedKey;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.closed = false;
    const messageHandler = onMessage ? (data, conn) => {
      const { cid: cid2, mid, signature, ciphertext } = data;
      const verified = this.ctx.verify({ data: ciphertext, signature, publicKey: this.publicKeys.signing });
      if (!verified)
        return;
      const message = this.ctx.decrypt({ data: ciphertext, sharedKey: this.sharedKey });
      const signed = this.ctx.sign({ data: { cid: cid2, message } });
      this.target.postMessage({ cid: cid2, mid, signature: signed, type: "sparks-channel:message-confirmation" }, this.origin);
      if (!this.closed)
        onMessage(message, conn);
    } : void 0;
    const handler = (event) => {
      const { data, origin: origin2 } = event;
      const { cid: cid2, type } = data;
      if (!cid2 || !type || !origin2)
        return;
      const isClosed = type === "sparks-channel:closed";
      const isMessage = type === "sparks-channel:message";
      if (isClosed && onClose) {
        onClose(cid2, this);
      } else if (isMessage && messageHandler) {
        messageHandler(data, this);
      }
    };
    const close = this.close.bind(this);
    this.close = async () => {
      await close();
      window.removeEventListener("message", handler);
    };
    window.addEventListener("message", handler);
    window.addEventListener("beforeunload", close);
  }
  async message(data) {
    console.log("hello", this.target, this.origin);
    const mid = util__default.default.encodeBase64(nacl__default.default.randomBytes(16));
    const ciphertext = this.ctx.encrypt({ data, sharedKey: this.sharedKey });
    const signature = this.ctx.sign({ data: ciphertext, detached: true });
    return new Promise((resolve, reject) => {
      const handler = (event) => {
        const { data: data2, source, origin } = event;
        if (data2.mid === mid && source === this.target && origin === this.origin && data2.type === "sparks-channel:message-confirmation") {
          if (this.closed)
            return reject("channel closed");
          else
            resolve(data2.signature);
          window.removeEventListener("message", handler);
        }
      };
      this.target.postMessage({ cid: this.cid, mid, type: "sparks-channel:message", ciphertext, signature }, this.origin);
      window.addEventListener("message", handler);
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
      window.addEventListener("message", handleDisconnect);
      this.target.postMessage({ cid: this.cid, type: "sparks-channel:closed" }, this.origin);
      this.closed = true;
    });
  }
}
class PostMessageManager {
  channels;
  constructor(ctx) {
    this.channels = [];
    const open = this.open.bind(this);
    this.open = (args) => {
      open({
        ...args,
        publicKeys: ctx.publicKeys,
        encrypt: ctx.encrypt.bind(ctx),
        decrypt: ctx.decrypt.bind(ctx),
        sign: ctx.sign.bind(ctx),
        verify: ctx.verify.bind(ctx),
        computeSharedKey: ctx.computeSharedKey.bind(ctx)
      });
    };
  }
  async close() {
    this.channels.forEach((channel) => channel.close());
    this.channels = [];
  }
  open(args) {
    const { target } = args;
    const { beforeOpen, onOpen, onClose, onMessage } = args;
    const { computeSharedKey, publicKeys: ourPublicKeys } = args;
    const { encrypt, decrypt, sign, verify } = args;
    if (!computeSharedKey)
      throw new Error("computeSharedKey is required");
    const channelId = util__default.default.encodeBase64(nacl__default.default.randomBytes(16));
    let requestInterval;
    const handler = (event) => {
      const { data: { cid, type, publicKeys }, origin, source } = event;
      const confirming = type === "sparks-channel:connection-confirmation";
      const requesting = type === "sparks-channel:connection-request";
      if (confirming && !cid)
        return;
      if (!type || !origin || !(confirming || requesting))
        return;
      if (requesting && !source)
        throw new Error("Invalid source");
      if (requesting && !publicKeys)
        throw new Error("Missing public keys");
      if (requesting && beforeOpen && !beforeOpen({ cid, origin, publicKeys }))
        return;
      const sharedKey = computeSharedKey({ publicKey: publicKeys.encryption });
      if (confirming) {
        if (!sharedKey)
          throw new Error("Failed to compute shared key");
        const exists = this.channels.find((channel2) => channel2.cid === cid);
        if (exists)
          return;
        const channel = new PostMessageChannel({ cid, origin, target: source, publicKeys, sharedKey, onOpen, onMessage, onClose, encrypt, decrypt, sign, verify });
        this.channels.push(channel);
        if (onOpen)
          onOpen(cid, channel);
        clearInterval(requestInterval);
        source.postMessage({ cid, type: "sparks-channel:connection-confirmation", publicKeys: ourPublicKeys }, origin);
        window.removeEventListener("message", handler);
      } else if (requesting) {
        if (!sharedKey)
          throw new Error("Failed to compute shared key");
        source.postMessage({
          type: "sparks-channel:connection-confirmation",
          cid,
          publicKeys
        }, origin);
      }
    };
    window.addEventListener("message", handler);
    if (!!target && typeof target === "string") {
      const targetOrigin = new URL(target).origin;
      const targetWindow = window.open(target, "_blank");
      if (!targetWindow)
        throw new Error("Failed to open window");
      requestInterval = setInterval(() => {
        targetWindow.postMessage({
          type: "sparks-channel:connection-request",
          cid: channelId,
          publicKeys: ourPublicKeys
        }, targetOrigin);
      }, 1e3);
    }
  }
}
const PostMessage = (Base) => class PostMessage extends Base {
  constructor(...args) {
    super(...args);
    this.postMessage = new PostMessageManager(this);
  }
};
PostMessage.type = "channel";
PostMessage.dependencies = {
  encrypt: true,
  hash: true,
  sign: true
};
var PostMessage_default = PostMessage;

module.exports = PostMessage_default;
