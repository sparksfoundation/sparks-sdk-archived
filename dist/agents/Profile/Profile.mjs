import { CoreAgent } from "../CoreAgent.mjs";
export class Profile extends CoreAgent {
  async import(data) {
    this.avatar = data.avatar;
    this.handle = data.handle;
    return Promise.resolve();
  }
  async export() {
    return Promise.resolve({
      avatar: this.avatar,
      handle: this.handle
    });
  }
}
