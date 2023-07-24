"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/hashers/Blake3/index.ts
var Blake3_exports = {};
__export(Blake3_exports, {
  Blake3: () => Blake3
});
module.exports = __toCommonJS(Blake3_exports);
var import_tweetnacl_util2 = __toESM(require("tweetnacl-util"), 1);
var import_blake3 = require("@noble/hashes/blake3");

// src/hashers/SparkHasher/index.ts
var SparkHasher = class {
  constructor() {
    this.hash = this.hash.bind(this);
  }
  async import(data) {
    return Promise.resolve();
  }
  async export() {
    return Promise.resolve({});
  }
};

// src/utilities/index.ts
var import_tweetnacl = __toESM(require("tweetnacl"), 1);
var import_tweetnacl_util = __toESM(require("tweetnacl-util"), 1);
var import_cuid2 = require("@paralleldrive/cuid2");
function utcEpochTimestamp() {
  const now = /* @__PURE__ */ new Date();
  return now.getTime() + now.getTimezoneOffset() * 60 * 1e3;
}
function randomCuid() {
  return (0, import_cuid2.createId)();
}

// src/events/SparkEvent/index.ts
var SparkEvent = class {
  type;
  timestamp;
  metadata;
  data;
  digest;
  constructor(args) {
    this.type = args.type;
    this.metadata = args.metadata;
    this.timestamp = args.timestamp;
    if (args.data)
      this.data = args.data;
    if (args.digest)
      this.digest = args.digest;
  }
};
var createEvent = (params) => {
  const { type, data, digest } = params;
  const timestamp = utcEpochTimestamp();
  const metadata = { ...params.metadata || {}, eventId: randomCuid() };
  const invalidEvent = !type.endsWith("_REQUEST") && !type.endsWith("_CONFIRM") && !type.endsWith("_ERROR");
  const invalidParams = !!(data && digest || !data && !digest);
  let event;
  if (!!data)
    event = new SparkEvent({ type, metadata, timestamp, data });
  else if (!!digest)
    event = new SparkEvent({ type, metadata, timestamp, digest });
  else
    event = null;
  if (invalidEvent || invalidParams || !event) {
    throw new SparkEvent({
      type: "CREATE_EVENT_ERROR",
      metadata: {
        eventId: randomCuid()
      },
      timestamp,
      data: { message: invalidEvent ? `Invalid event type: ${type}` : `Invalid event params: ${JSON.stringify(params)}` }
    });
  }
  const isError = event.type.endsWith("_ERROR");
  return event;
};

// src/errors/hashers.ts
var HasherErrorTypes = {
  HASING_ERROR: "HASING_ERROR",
  HASHER_UNEXPECTED_ERROR: "HASHER_UNEXPECTED_ERROR"
};
var HasherErrors = {
  HASING_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: HasherErrorTypes.HASING_ERROR,
    metadata: { ...metadata },
    data: { message: "Failed to hash data." }
  }),
  HASHER_UNEXPECTED_ERROR: ({ metadata = {}, message } = {}) => createEvent({
    type: HasherErrorTypes.HASHER_UNEXPECTED_ERROR,
    metadata: { ...metadata },
    data: { message: message || "Unexpected hasher error." }
  })
};

// src/hashers/Blake3/index.ts
var Blake3 = class extends SparkHasher {
  async import(data) {
    await super.import(data);
    return Promise.resolve();
  }
  async export() {
    const data = await super.export();
    return Promise.resolve(data);
  }
  async hash({ data }) {
    try {
      const stringData = typeof data !== "string" ? JSON.stringify(data) : data;
      const hashedString = (0, import_blake3.blake3)(stringData);
      const b64DHash = import_tweetnacl_util2.default.encodeBase64(hashedString);
      if (!b64DHash)
        throw HasherErrors.HASING_ERROR();
      return b64DHash;
    } catch (error) {
      if (error instanceof SparkEvent)
        return Promise.reject(error);
      return Promise.reject(HasherErrors.HASHER_UNEXPECTED_ERROR({
        message: `Failed to hash data. ${error?.message || ""}`
      }));
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Blake3
});
//# sourceMappingURL=index.cjs.map