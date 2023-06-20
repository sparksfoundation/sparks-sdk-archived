import nacl from "tweetnacl";
import util from "tweetnacl-util";
export function getTimestamp() {
  const now = /* @__PURE__ */ new Date();
  return now.getTime() + now.getTimezoneOffset() * 60 * 1e3;
}
export function parseJSON(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
}
export function randomNonce(len) {
  return util.encodeBase64(nacl.randomBytes(nacl.secretbox.nonceLength));
}
