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

// src/agents/Attester/index.ts
import Ajv from "ajv";
import { MerkleTree } from "merkletreejs";
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
    const ajv = new Ajv();
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
    const merkleTree = new MerkleTree(leaves, this.hash);
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
export {
  Attester
};
//# sourceMappingURL=index.js.map