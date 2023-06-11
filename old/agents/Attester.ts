
const Attester = Base => class Attester extends Base {
    constructor(...args) {
        super(...args);
    }
}

Attester.type = 'agent';

export default Attester;