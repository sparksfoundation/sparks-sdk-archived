import nacl from "tweetnacl";
import util from "tweetnacl-util";
export function utcEpochTimestamp() {
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
export function randomSalt() {
  return util.encodeBase64(nacl.randomBytes(32));
}
