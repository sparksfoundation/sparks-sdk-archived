// src/controllers/SparkController/types.ts
var KeyEventType = /* @__PURE__ */ ((KeyEventType2) => {
  KeyEventType2["INCEPT"] = "INCEPT";
  KeyEventType2["ROTATE"] = "ROTATE";
  KeyEventType2["DESTROY"] = "DESTROY";
  return KeyEventType2;
})(KeyEventType || {});

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

// src/errors/controllers.ts
var ControllerErrorTypes = {
  CONTROLLER_ALREADY_INCEPTED_ERROR: "CONTROLLER_ALREADY_INCEPTED_ERROR",
  CONTROLLER_INCEPTION_MISSING_ERROR: "CONTROLLER_INCEPTION_MISSING_ERROR",
  CONTROLLER_ALREADY_DESTROYED_ERROR: "CONTROLLER_ALREADY_DESTROYED_ERROR",
  CONTROLLER_INVALID_NEXT_KEYPAIRS_ERROR: "CONTROLLER_INVALID_NEXT_KEYPAIRS_ERROR",
  CONTROLLER_INVALID_KEY_EVENT_TYPE_ERROR: "CONTROLLER_INVALID_KEY_EVENT_TYPE_ERROR",
  CONTROLLER_INVALID_NEXT_KEY_COMMITMENT_ERROR: "CONTROLLER_INVALID_NEXT_KEY_COMMITMENT_ERROR",
  CONTROLLER_MISSING_PREVIOUS_DIGEST_ERROR: "CONTROLLER_MISSING_PREVIOUS_DIGEST_ERROR",
  CONTROLLER_MISSING_IDENTIFIER_ERROR: "CONTROLLER_MISSING_IDENTIFIER_ERROR",
  CONTROLLER_UNEXPECTED_ERROR: "CONTROLLER_UNEXPECTED_ERROR"
};
var ControllerErrors = {
  CONTROLLER_ALREADY_INCEPTED_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_ALREADY_INCEPTED_ERROR,
    metadata: { ...metadata },
    data: { message: "Controller already incepted." }
  }),
  CONTROLLER_INCEPTION_MISSING_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_INCEPTION_MISSING_ERROR,
    metadata: { ...metadata },
    data: { message: "Missing controller inception." }
  }),
  CONTROLLER_ALREADY_DESTROYED_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_ALREADY_DESTROYED_ERROR,
    metadata: { ...metadata },
    data: { message: "Controller already destroyed." }
  }),
  CONTROLLER_INVALID_NEXT_KEYPAIRS_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_INVALID_NEXT_KEYPAIRS_ERROR,
    metadata: { ...metadata },
    data: { message: "Invalid next keypairs." }
  }),
  CONTROLLER_INVALID_KEY_EVENT_TYPE_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_INVALID_KEY_EVENT_TYPE_ERROR,
    metadata: { ...metadata },
    data: { message: "Invalid key event type." }
  }),
  CONTROLLER_INVALID_NEXT_KEY_COMMITMENT_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_INVALID_NEXT_KEY_COMMITMENT_ERROR,
    metadata: { ...metadata },
    data: { message: "Invalid next key commitment." }
  }),
  CONTROLLER_MISSING_PREVIOUS_DIGEST_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_MISSING_PREVIOUS_DIGEST_ERROR,
    metadata: { ...metadata },
    data: { message: "Missing previous key event digest." }
  }),
  CONTROLLER_MISSING_IDENTIFIER_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_MISSING_IDENTIFIER_ERROR,
    metadata: { ...metadata },
    data: { message: "Missing controller identifier." }
  }),
  CONTROLLER_UNEXPECTED_ERROR: ({ metadata = {}, message } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_UNEXPECTED_ERROR,
    metadata: { ...metadata },
    data: { message: message || "Unexpected controller error." }
  })
};

// src/errors/spark.ts
var SparkErrorTypes = {
  SPARK_IMPORT_ERROR: "SPARK_IMPORT_ERROR",
  SPARK_EXPORT_ERROR: "SPARK_EXPORT_ERROR",
  SPARK_UNEXPECTED_ERROR: "SPARK_UNEXPECTED_ERROR"
};
var SparkErrors = {
  SPARK_IMPORT_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: SparkErrorTypes.SPARK_IMPORT_ERROR,
    metadata: { ...metadata },
    data: { message: "Failed to import data." }
  }),
  SPARK_EXPORT_ERROR: ({ metadata = {} } = {}) => createEvent({
    type: SparkErrorTypes.SPARK_EXPORT_ERROR,
    metadata: { ...metadata },
    data: { message: "Failed to export data." }
  }),
  SPARK_UNEXPECTED_ERROR: ({ metadata = {}, message } = {}) => createEvent({
    type: SparkErrorTypes.SPARK_UNEXPECTED_ERROR,
    metadata: { ...metadata },
    data: { message: message || "Unexpected spark error." }
  })
};

// src/controllers/SparkController/index.ts
var SparkController = class {
  _spark;
  _identifier;
  _keyEventLog;
  constructor(spark) {
    this._spark = spark;
    this._keyEventLog = [];
    this.incept = this.incept.bind(this);
    this.rotate = this.rotate.bind(this);
    this.destroy = this.destroy.bind(this);
  }
  get identifier() {
    return this._identifier;
  }
  get keyEventLog() {
    return this._keyEventLog;
  }
  async import(data) {
    if (!data.identifier || !data.keyEventLog)
      throw SparkErrors.SPARK_IMPORT_ERROR();
    this._identifier = data.identifier;
    this._keyEventLog = data.keyEventLog;
    return Promise.resolve();
  }
  async export() {
    if (!this._identifier || !this._keyEventLog)
      throw SparkErrors.SPARK_EXPORT_ERROR();
    return Promise.resolve({
      identifier: this._identifier,
      keyEventLog: this._keyEventLog
    });
  }
};

// src/controllers/Basic/index.ts
var Basic = class extends SparkController {
  async import(data) {
    if (!data)
      throw SparkErrors.SPARK_IMPORT_ERROR();
    await super.import(data);
    return Promise.resolve();
  }
  async export() {
    const data = await super.export();
    return Promise.resolve(data);
  }
  async keyEvent({ nextKeyPairs, type }) {
    const keyPairs = this._spark.keyPairs;
    const previousKeyCommitment = this.keyEventLog[this.keyEventLog.length - 1]?.nextKeyCommitments;
    const keyCommitment = await this._spark.hash({ data: keyPairs.signer.publicKey });
    const nextKeyCommitments = type === "DESTROY" /* DESTROY */ ? void 0 : await this._spark.hash({ data: nextKeyPairs?.signer.publicKey });
    try {
      switch (true) {
        case (type === "INCEPT" /* INCEPT */ && this.keyEventLog.length > 0):
          throw ControllerErrors.CONTROLLER_ALREADY_INCEPTED_ERROR();
        case (type === "ROTATE" /* ROTATE */ && this.keyEventLog.length === 0):
        case (type === "DESTROY" /* DESTROY */ && this.keyEventLog.length === 0):
          throw ControllerErrors.CONTROLLER_INCEPTION_MISSING_ERROR();
        case (type === "DESTROY" /* DESTROY */ && this.keyEventLog.length > 0 && this.keyEventLog[this.keyEventLog.length - 1].type === "DESTROY" /* DESTROY */):
          throw ControllerErrors.CONTROLLER_ALREADY_DESTROYED_ERROR();
        case (type !== "DESTROY" /* DESTROY */ && !nextKeyPairs):
          throw ControllerErrors.CONTROLLER_INVALID_NEXT_KEYPAIRS_ERROR();
        case !Object.values(KeyEventType).includes(type):
          throw ControllerErrors.CONTROLLER_INVALID_KEY_EVENT_TYPE_ERROR();
        case (type === "ROTATE" /* ROTATE */ && previousKeyCommitment !== keyCommitment):
          throw ControllerErrors.CONTROLLER_INVALID_NEXT_KEY_COMMITMENT_ERROR();
        case (this.keyEventLog.length > 0 && !this.keyEventLog[this.keyEventLog.length - 1].selfAddressingIdentifier):
          throw ControllerErrors.CONTROLLER_MISSING_PREVIOUS_DIGEST_ERROR();
      }
      const baseEventProps = {
        index: this.keyEventLog.length,
        signingThreshold: 1,
        signingKeys: [keyPairs.signer.publicKey],
        backerThreshold: 0,
        backers: [],
        nextKeyCommitments
      };
      const eventJSON = JSON.stringify(baseEventProps);
      const versionData = eventJSON.length.toString(16).padStart(6, "0");
      const version = "KERI10JSON" + versionData + "_";
      const hashedEvent = await this._spark.hash({ data: eventJSON });
      const selfAddressingIdentifier = await this._spark.seal({ data: hashedEvent });
      const identifier = this._identifier || `B${selfAddressingIdentifier}`;
      const previousEventDigest = this.keyEventLog[this.keyEventLog.length - 1]?.selfAddressingIdentifier;
      const commonEventProps = {
        identifier,
        type,
        version,
        ...baseEventProps,
        selfAddressingIdentifier
      };
      switch (type) {
        case "INCEPT" /* INCEPT */:
          return {
            ...commonEventProps,
            type: "INCEPT" /* INCEPT */
          };
        case "ROTATE" /* ROTATE */:
          return {
            ...commonEventProps,
            type: "ROTATE" /* ROTATE */,
            previousEventDigest
          };
        case "DESTROY" /* DESTROY */:
          return {
            ...commonEventProps,
            type: "DESTROY" /* DESTROY */,
            previousEventDigest,
            nextKeyCommitments: [],
            signingKeys: []
          };
        default:
          throw ControllerErrors.CONTROLLER_INVALID_KEY_EVENT_TYPE_ERROR();
      }
    } catch (error) {
      if (error instanceof SparkEvent)
        return Promise.reject(error);
      return Promise.reject(ControllerErrors.CONTROLLER_UNEXPECTED_ERROR({
        message: `Failed to create key event. ${error?.message || ""}`
      }));
    }
  }
  async incept() {
    try {
      const keyPairs = this._spark.keyPairs;
      const inceptionEvent = await this.keyEvent({ nextKeyPairs: keyPairs, type: "INCEPT" /* INCEPT */ });
      this.keyEventLog.push(inceptionEvent);
      this._identifier = inceptionEvent.identifier;
    } catch (error) {
      return Promise.reject(error);
    }
  }
  async rotate({ nextKeyPairs }) {
    try {
      const rotationEvent = await this.keyEvent({ nextKeyPairs, type: "ROTATE" /* ROTATE */ });
      this.keyEventLog.push(rotationEvent);
    } catch (error) {
      return Promise.reject(error);
    }
  }
  async destroy() {
    try {
      const destructionEvent = await this.keyEvent({ type: "DESTROY" /* DESTROY */ });
      this.keyEventLog.push(destructionEvent);
    } catch (error) {
      return Promise.reject(error);
    }
  }
};
export {
  Basic
};
//# sourceMappingURL=index.js.map