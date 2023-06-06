var Verifier_default = (Base, symbols) => class Verifier extends Base {
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
      let valid2 = true;
      const { selfAddressingIdentifier, version, ...eventBody } = event;
      const data = this.hash(JSON.stringify(eventBody));
      const dataInTact = this.verify({
        data,
        signature: selfAddressingIdentifier,
        publicKey: event.signingKeys[0]
      });
      valid2 = valid2 && dataInTact;
      if (index > 0) {
        const keyCommittment = eventLog[index - 1].nextKeyCommitments[0];
        const currenKey = this.hash(event.signingKeys[0]);
        const committmentValid = currenKey === keyCommittment;
        valid2 = valid2 && committmentValid;
      }
      return valid2;
    });
    return valid;
  }
};

export { Verifier_default as default };