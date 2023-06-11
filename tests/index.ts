import { Spark, Controller, Verifier, Attester } from '../dist/index.js';

type UserType = InstanceType<typeof Verifier> & InstanceType<typeof Attester> & InstanceType<typeof Controller>;

const User = Spark({
  controller: Controller,
  agents: [ Verifier, Attester ],
});

const user = new User() as UserType;

user.verify()