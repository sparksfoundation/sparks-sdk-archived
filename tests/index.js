import { Spark, Controller, Verifier, Attester } from '../dist/index.js';
const User = Spark({
    controller: Controller,
    agents: [Verifier, Attester],
});
const user = new User();
user.verify();
