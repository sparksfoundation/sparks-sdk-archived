export class CoreHasher {
  constructor() {
    this.hash = this.hash.bind(this);
  }
  async import(data) {
    return Promise.resolve();
  }
  async export() {
    return Promise.resolve({});
  }
}
