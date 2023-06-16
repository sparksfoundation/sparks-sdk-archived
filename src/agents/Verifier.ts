import { Agent } from "./Agent.js";

export class Verifier extends Agent {

  /**
 * Verifies the data integrity and key commitment of the entire event log
 * @param eventLog
 * @returns
 */
  async verifyEventLog(eventLog) {
    const valid = eventLog.every(async (event, index) => {
      let valid = true;

      // what's happening here... it's checking that the event hasn't been tampered with
      const { previousEventDigest, selfAddressingIdentifier, version, ...eventBody } = event;

      const data = await this.spark.hash(JSON.stringify(eventBody));

      const dataInTact = await this.spark.verify({
        data,
        signature: selfAddressingIdentifier,
        publicKey: event.signingKeys[0],
      });
      valid = valid && dataInTact;

      // let's check that the current key is the same as the previous committed to using
      if (index > 0) {
        const keyCommittment = eventLog[index - 1].nextKeyCommitments[0];
        const currenKey = this.spark.hash(event.signingKeys[0]);
        const committmentValid = currenKey === keyCommittment;
        valid = valid && committmentValid;
      }
      return valid;
    });

    return valid;
  }
}
