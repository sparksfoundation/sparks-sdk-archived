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

// src/agents/Attester/index.ts
var Attester_exports = {};
__export(Attester_exports, {
  Attester: () => Attester
});
module.exports = __toCommonJS(Attester_exports);

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

// src/agents/Attester/index.ts
var import_ajv = __toESM(require("ajv"), 1);
var import_merkletreejs = require("merkletreejs");
var Attester = class extends SparkAgent {
  constructor(spark) {
    super(spark);
    this.buildCredential = this.buildCredential.bind(this);
    this.hash = this.hash.bind(this);
  }
  hash(data) {
    return this._spark.hasher.hash({ data });
  }
  getLeafHashes(data) {
    return Object.keys(data).flatMap((key) => {
      if (Array.isArray(data[key])) {
        return data[key].map((element) => {
          return typeof element === "object" ? JSON.stringify(element) : element.toString();
        }).map(this.hash);
      }
      const value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key].toString();
      return this.hash(value);
    });
  }
  async getMerkleAttributeProofs(tree, leaves, data) {
    const proofs = Object.keys(data).flatMap((attributeKey, index) => {
      if (Array.isArray(data[attributeKey])) {
        return data[attributeKey].map((element, childIndex) => {
          const proofIndex = index + childIndex;
          const proof2 = tree.getProof(leaves[proofIndex], proofIndex);
          return {
            attribute: `${attributeKey}.${childIndex}`,
            proof: proof2.map((node) => node.data.toString("hex"))
          };
        });
      }
      const proof = tree.getProof(leaves[index], index);
      return {
        attribute: attributeKey,
        proof: proof.map((node) => node.data.toString("hex"))
      };
    });
    return {
      "merkleRoot": tree.getHexRoot(),
      "attributes": proofs
    };
  }
  async buildCredential({ schema, data }) {
    const ajv = new import_ajv.default();
    const validate = ajv.compile(schema.properties.credentialSubject);
    const isValid = validate(data);
    if (!isValid) {
      console.log(validate.errors);
      return null;
    }
    const verifiableCredential = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://sparks.foundation/credentials/ethereum/schema"
      ],
      "id": schema["id"],
      "type": ["VerifiableCredential", schema["name"].replace(" ", "")],
      "issuer": this._spark.identifier,
      "issuanceDate": (/* @__PURE__ */ new Date()).toISOString(),
      "credentialSubject": {
        ...data
      }
    };
    const leaves = this.getLeafHashes(data);
    const merkleTree = new import_merkletreejs.MerkleTree(leaves, this.hash);
    const merkle = await this.getMerkleAttributeProofs(merkleTree, leaves, data);
    const proofs = [
      {
        "type": "DataIntegrityProof",
        "created": (/* @__PURE__ */ new Date()).toISOString(),
        "verificationMethod": this._spark.identifier,
        "signatureValue": await this._spark.signer.seal({ data: verifiableCredential })
      },
      {
        "type": "MerkleProof",
        "signatureAlgorithm": this._spark.signer.algorithm,
        "digestAlgorithm": this._spark.hasher.algorithm,
        "signatureValue": await this._spark.signer.seal({ data: merkle })
      }
    ];
    verifiableCredential.proofs = proofs;
    return verifiableCredential;
  }
  async import(data) {
    return Promise.resolve();
  }
  async export() {
    return Promise.resolve({});
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Attester
});
//# sourceMappingURL=index.cjs.map