import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

const signingKeyPair = () => {
  const signing = nacl.sign.keyPair();
  return {
    publicKey: util.encodeBase64(signing.publicKey),
    secretKey: util.encodeBase64(signing.secretKey)
  };
};
const encryptionKeyPair = () => {
  const encryption = nacl.box.keyPair();
  return {
    publicKey: util.encodeBase64(encryption.publicKey),
    secretKey: util.encodeBase64(encryption.secretKey)
  };
};
const generateKeyPairs = () => {
  return {
    signing: signingKeyPair(),
    encryption: encryptionKeyPair()
  };
};
var Random_default = (Base) => class Password extends Base {
  #randomKeyPairs = [];
  constructor(...args) {
    super(...args);
  }
  incept() {
    const keyPairs = generateKeyPairs();
    const nextKeyPairs = generateKeyPairs();
    this.#randomKeyPairs = [keyPairs, nextKeyPairs];
    super.incept({ keyPairs, nextKeyPairs });
  }
  rotate() {
    const keyPairs = { ...this.#randomKeyPairs[this.#randomKeyPairs.length - 1] };
    const nextKeyPairs = generateKeyPairs();
    this.#randomKeyPairs.push(nextKeyPairs);
    super.rotate({ keyPairs, nextKeyPairs });
  }
};

export { Random_default as default };
