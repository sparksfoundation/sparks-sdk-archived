const Verifier = Base => class Verifier extends Base {
  constructor(...args) {
    super(...args);
  }

  /**
   * Verifies the data integrity and key commitment of the entire event log
   * @param eventLog 
   * @returns 
   */
  verifyEventLog(eventLog) {
    const valid = eventLog.every((event, index) => {
      let valid = true;

      // what's happening here... it's checking that the event hasn't been tampered with
      const { selfAddressingIdentifier, version, ...eventBody } = event;
      const data = this.hash(JSON.stringify(eventBody));
      const dataInTact = this.verify({
        data,
        signature: selfAddressingIdentifier,
        publicKey: event.signingKeys[0],
      });
      valid = valid && dataInTact;

      // let's check that the current key is the same as the previous committed to using
      if (index > 0) {
        const keyCommittment = eventLog[index - 1].nextKeyCommitments[0];
        const currenKey = this.hash(event.signingKeys[0]);
        const committmentValid = currenKey === keyCommittment;
        valid = valid && committmentValid;
      }
      return valid;
    });

    return valid;
  }
}

Verifier.type = 'agent';
Verifier.dependencies = {
  hash: true,
  sign: true,
};

export default Verifier;