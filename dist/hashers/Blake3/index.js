// src/hashers/Blake3/index.ts
import util2 from "tweetnacl-util";
import { blake3 } from "@noble/hashes/blake3";

// src/hashers/SparkHasher/index.ts
var SparkHasher = class {
  algorithm;
  constructor({ algorithm }) {
    this.algorithm = algorithm;
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
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { createId, isCuid } from "@paralleldrive/cuid2";
function utcEpochTimestamp() {
  const now = /* @__PURE__ */ new Date();
  return now.getTime() + now.getTimezoneOffset() * 60 * 1e3;
}
function randomCuid() {
  return createId();
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
  constructor() {
    super({
      algorithm: "blake3"
    });
  }
  async import(data) {
    await super.import(data);
    return Promise.resolve();
  }
  async export() {
    const data = await super.export();
    return Promise.resolve(data);
  }
  hash({ data }) {
    try {
      const stringData = typeof data !== "string" ? JSON.stringify(data) : data;
      const hashedString = blake3(stringData);
      const b64DHash = util2.encodeBase64(hashedString);
      if (!b64DHash)
        throw HasherErrors.HASING_ERROR();
      return b64DHash;
    } catch (error) {
      if (error instanceof SparkEvent)
        throw error;
      throw HasherErrors.HASHER_UNEXPECTED_ERROR({
        message: `Failed to hash data. ${error?.message || ""}`
      });
    }
  }
};
export {
  Blake3
};
//# sourceMappingURL=index.js.map