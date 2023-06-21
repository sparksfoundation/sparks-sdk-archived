import { AAgent } from "../Agent/types.mjs";
export class Verifier extends AAgent {
  async verifyEventLog(eventLog) {
    const valid = eventLog.every(async (event, index) => {
      let valid2 = true;
      const { previousEventDigest, selfAddressingIdentifier, version, ...eventBody } = event;
      const data = await this.spark.hash(JSON.stringify(eventBody));
      const dataInTact = await this.spark.verify({
        data,
        signature: selfAddressingIdentifier,
        publicKey: event.signingKeys[0]
      });
      valid2 = valid2 === true && dataInTact === true;
      if (index > 0) {
        const keyCommittment = eventLog[index - 1].nextKeyCommitments[0];
        const currenKey = this.spark.hash(event.signingKeys[0]);
        const committmentValid = currenKey === keyCommittment;
        valid2 = valid2 && committmentValid;
      }
      return valid2;
    });
    return valid;
  }
}
