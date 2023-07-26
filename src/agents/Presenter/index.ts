import { SparkErrors } from "../../errors/spark";
import { SparkInterface } from "../../spark/types";
import { SparkAgent } from "../SparkAgent";

export class Presenter extends SparkAgent {
  private _credentials: Record<string, any>[];

  constructor(spark: SparkInterface<any, any, any, any, any>) {
    super(spark);
    this._credentials = [];
  }

  public get credentials(): Record<string, any>[] {
    return this._credentials;
  }

  public addCredential(credential: any): void {
    // if it's not already in the list, add it
    if (!this._credentials.find((c) => {
      return JSON.stringify(c) === JSON.stringify(credential);
    })) {
      this._credentials.push(credential);
    }
  }

  public removeCredential(credential: any): void {
    this._credentials = this._credentials.filter((c) => {
      const aProof = c.proofs[0].signatureValue;
      const bProof = credential.proofs[0].signatureValue;
      return aProof !== bProof;
    });
  }

  public async import(data: Record<string, any>): Promise<void> {
    if (data?.credentials) this._credentials = data.credentials;
    return Promise.resolve();
  }

  public async export(): Promise<Record<string, any>> {
    return Promise.resolve({
      credentials: this._credentials,
    });
  }
}
