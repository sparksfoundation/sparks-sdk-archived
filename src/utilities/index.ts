import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { createId, isCuid } from '@paralleldrive/cuid2';

/**
 * @returns a timestamp in milliseconds since epoch in terms of UTC
 */
export function utcEpochTimestamp() {
  const now = new Date()
  return now.getTime() + now.getTimezoneOffset() * 60 * 1000;
}

/**
 * @returns a parsed json string or null if it fails
 */
export function parseJSON(data: string) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
}

/**
 * @returns a new unique salt
 */
export function randomSalt(len: number = 32) {
  return util.encodeBase64(nacl.randomBytes(len));
}

/**
 * @returns a new unique identifier
 */
export function randomCuid() {
  return createId();
}

/**
 * @returns whether the identifier is a valid CUID
 */
export function validCuid(id: string) {
  return isCuid(id);
}

/**
 * SNAKE_CASE to PascalCase
 * @returns a PascalCase string
 */
export function snakeToPascal(str: string) {
  return str.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase()).replace(/^[a-z]/, char => char.toUpperCase());
}