export const parseJSON = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return;
  }
};
export class Fail {
  constructor({ type, message, metadata }) {
    this.type = type;
    this.message = message;
    this.timestamp = Date.now();
    this.metadata = metadata || {};
  }
}
