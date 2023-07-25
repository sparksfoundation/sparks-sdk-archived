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

// src/agents/SparkAgent/index.ts
var SparkAgent = class {
  _spark;
  constructor(spark) {
    this._spark = spark;
  }
  async import(data) {
    if (!data)
      throw SparkErrors.SPARK_IMPORT_ERROR();
    return Promise.resolve();
  }
  async export() {
    return Promise.resolve({});
  }
};

// src/agents/Profile/index.ts
var Profile = class extends SparkAgent {
  avatar;
  handle;
  async import(data) {
    if (!data)
      throw SparkErrors.SPARK_IMPORT_ERROR();
    this.avatar = data.avatar;
    this.handle = data.handle;
    return Promise.resolve();
  }
  async export() {
    return Promise.resolve({
      avatar: this.avatar,
      handle: this.handle
    });
  }
};
export {
  Profile
};
//# sourceMappingURL=index.js.map