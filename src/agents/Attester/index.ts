import { SparkErrors } from "../../errors/spark";
import { SparkAgent } from "../SparkAgent";
import Ajv from "ajv"
import { MerkleTree } from "merkletreejs";

export class Attester extends SparkAgent {

  constructor(spark: any) {
    super(spark);
    this.buildCredential = this.buildCredential.bind(this);
    this.hash = this.hash.bind(this);
  }

  private hash(data: string) {
    return this._spark.hasher.hash({ data });
  }

  private getLeafHashes(data: Record<string, any>) {
    return Object.keys(data).flatMap((key) => {
      // if it's an array, hash each element
      if (Array.isArray(data[key])) {
        return data[key].map((element: any) => {
          return typeof element === "object" ? JSON.stringify(element) : element.toString();
        }).map(this.hash);
      }
      const value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key].toString();
      return this.hash(value);
    })
  }

  private async getMerkleAttributeProofs(tree: MerkleTree, leaves: string[], data: Record<string, any>) {
    const proofs = Object.keys(data).flatMap((attributeKey, index) => {
      if (Array.isArray(data[attributeKey])) {
        return data[attributeKey].map((element: any, childIndex: number) => {
          const proofIndex = index + childIndex;
          const proof = tree.getProof(leaves[proofIndex], proofIndex);
          return {
            attribute: `${attributeKey}.${childIndex}`,
            proof: proof.map((node) => node.data.toString('hex')),
          };
        });
      }

      const proof = tree.getProof(leaves[index], index);
      return {
        attribute: attributeKey,
        proof: proof.map((node) => node.data.toString('hex')),
      };
    })

    return {
      "merkleRoot": tree.getHexRoot(),
      "attributes": proofs,
    }
  }

  public async buildCredential({ schema, data }: { schema: Record<string, any>, data: Record<string, any> }) {

    const ajv = new Ajv(); // Create an instance of Ajv
    const validate = ajv.compile(schema.properties.credentialSubject); // Compile the schema
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
      "issuanceDate": new Date().toISOString(),
      "credentialSubject": {
        ...data,
      }
    } as any;

    const leaves = this.getLeafHashes(data);
    const merkleTree = new MerkleTree(leaves, this.hash);
    const merkle = await this.getMerkleAttributeProofs(merkleTree, leaves, data);

    const proofs = [
      {
        "type": "DataIntegrityProof",
        "created": new Date().toISOString(),
        "verificationMethod": this._spark.identifier,
        "signatureValue": await this._spark.signer.seal({ data: verifiableCredential }),
      },
      {
        "type": "MerkleProof",
        "signatureAlgorithm": this._spark.signer.algorithm,
        "digestAlgorithm": this._spark.hasher.algorithm,
        "signatureValue": await this._spark.signer.seal({ data: merkle }),
      }
    ]

    // Include the Merkle root and proofs in the Verifiable Credential
    verifiableCredential.proofs = proofs;

    return verifiableCredential;
  }

  public async import(data: Record<string, any>): Promise<void> {
    return Promise.resolve();
  }

  public async export(): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
