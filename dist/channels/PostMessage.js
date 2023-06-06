class PostMessageChannel {
  #keyPairs;
  #sharedKey;
  #listeners;
  #encrypt;
  #decrypt;
  #sign;
  #verify;
  #computeSharedKey;
  target;
  origin;
  publicKeys;
  constructor({ keyPairs, encrypt, decrypt, sign, verify, computeSharedKey }) {
    this.#keyPairs = keyPairs;
    this.#encrypt = encrypt;
    this.#decrypt = decrypt;
    this.#sign = sign;
    this.#verify = verify;
    this.#computeSharedKey = computeSharedKey;
    this.#listeners = /* @__PURE__ */ new Map();
    window.addEventListener("beforeunload", async () => {
      await this.disconnect();
    });
  }
  accept({ url }) {
    return new Promise((resolve, reject) => {
      const origin = new URL(url).origin;
      const handler = (event) => {
        if (event.data.type !== "connectionRequest")
          return;
        if (event.origin !== origin)
          return;
        if (!event.data.publicKeys)
          return;
        event.source.postMessage({
          type: "connectionConfirmation",
          publicKeys: {
            signing: this.#keyPairs.signing.publicKey,
            encryption: this.#keyPairs.encryption.publicKey
          }
        }, event.origin);
        this.target = window.opener;
        this.origin = event.origin;
        this.publicKeys = event.data.publicKeys;
        this.#sharedKey = this.#computeSharedKey({ publicKey: this.publicKeys.encryption });
        this.target.postMessage({ type: "connected" }, this.origin);
        window.removeEventListener("message", handler);
        resolve(this);
      };
      window.addEventListener("message", handler);
    });
  }
  connect({ url }) {
    return new Promise((resolve, reject) => {
      const origin = new URL(url).origin;
      const target = window.open(url, origin);
      if (!target)
        return reject(new Error("Failed to open window"));
      const interval = setInterval(() => {
        target.postMessage({
          type: "connectionRequest",
          publicKeys: {
            signing: this.#keyPairs.signing.publicKey,
            encryption: this.#keyPairs.encryption.publicKey
          }
        }, origin);
      }, 1e3);
      const handler = (event) => {
        if (event.origin !== origin)
          return;
        if (event.data.type !== "connectionConfirmation")
          return;
        if (!event.data.publicKeys)
          return;
        this.target = target;
        this.origin = origin;
        this.publicKeys = event.data.publicKeys;
        this.#sharedKey = this.#computeSharedKey({ keyPairs: this.#keyPairs, publicKey: this.publicKeys.encryption });
        this.target.postMessage({ type: "connected" }, this.origin);
        window.removeEventListener("message", handler);
        clearInterval(interval);
        resolve(this);
      };
      window.addEventListener("message", handler);
    });
  }
  disconnect() {
    return new Promise((resolve, reject) => {
      const handleDisconnect = (event) => {
        if (event.source === this.target && event.origin === this.origin && event.data === "disconnectConfirmation") {
          window.removeEventListener("message", handleDisconnect);
          resolve(true);
        }
      };
      this.target.postMessage({ type: "disconnected" }, this.origin);
      window.addEventListener("message", handleDisconnect);
    });
  }
  send(data) {
    if (!this.target)
      throw new Error("not connected yet");
    const ciphertext = this.#encrypt({ data, sharedKey: this.#sharedKey });
    const signature = this.#sign({ data: ciphertext, detached: true });
    return new Promise((resolve, reject) => {
      const handleMessage = (event) => {
        if (event.source === this.target && event.origin === this.origin && event.data === "messageConfirmation") {
          window.removeEventListener("message", handleMessage);
          resolve(true);
        }
      };
      window.addEventListener("message", handleMessage);
      this.target.postMessage({ type: "message", message: { ciphertext, signature } }, this.origin);
    });
  }
  on(eventType, callback) {
    const allowed = ["message", "disconnected", "connected"];
    if (!allowed.includes(eventType))
      return;
    const listener = (event) => {
      var _a, _b;
      if (event.source === this.target && event.origin === this.origin && ((_a = event.data) == null ? void 0 : _a.type) === eventType) {
        if (((_b = event.data) == null ? void 0 : _b.type) !== "message") {
          return callback(event.data.message);
        }
        const { signature, ciphertext } = event.data.message;
        const verified = this.#verify({ data: ciphertext, signature, publicKey: this.publicKeys.signing });
        if (!verified)
          return;
        const message = this.#decrypt({ data: ciphertext, sharedKey: this.#sharedKey });
        callback(message);
      }
    };
    this.#listeners.set(callback, listener);
    window.addEventListener("message", listener);
  }
}
var PostMessage_default = (Base, symbols) => class PostMessage extends Base {
  constructor(...args) {
    super(...args);
    this.channels = this.channels || [];
  }
  postMessage() {
    const channel = new PostMessageChannel({
      keyPairs: this[symbols.keyPairs],
      encrypt: this.encrypt.bind(this),
      decrypt: this.decrypt.bind(this),
      sign: this.sign.bind(this),
      verify: this.verify.bind(this),
      computeSharedKey: this.sharedKey.bind(this)
    });
    this.channels.push(channel);
    return channel;
  }
};

export { PostMessage_default as default };
