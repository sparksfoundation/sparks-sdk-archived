import { MixinType } from "./mixins.js";

// Mixin: Agent is an abstract class that provides base agent functionality
export abstract class Agent {
  static type = MixinType.AGENT;
  constructor(args) {}
}