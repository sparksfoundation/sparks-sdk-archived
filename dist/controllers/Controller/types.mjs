import { Controller } from "./Controller.mjs";
export var KeriEventType = /* @__PURE__ */ ((KeriEventType2) => {
  KeriEventType2["INCEPTION"] = "incept";
  KeriEventType2["ROTATION"] = "rotate";
  KeriEventType2["DELETION"] = "delete";
  return KeriEventType2;
})(KeriEventType || {});
export class AController {
  constructor(spark) {
    if (!spark)
      throw new Error("Controller: missing spark");
    this.spark = spark;
    Object.defineProperties(this, { spark: { enumerable: false, writable: false } });
    this.controller = new Controller(this.spark);
  }
  get keyEventLog() {
    return this.controller.keyEventLog;
  }
  get encryptionKeys() {
    return this.controller.encryptionKeys;
  }
  get signingKeys() {
    return this.controller.signingKeys;
  }
  get secretKeys() {
    return this.controller.secretKeys;
  }
  get publicKeys() {
    return this.controller.publicKeys;
  }
}
