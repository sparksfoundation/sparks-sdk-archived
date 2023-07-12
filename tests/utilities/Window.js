import { EventEmitter } from 'events';

export class Window extends EventEmitter {
  origin;
  static windows = {};

  constructor(origin) {
    super();
    if (Window.windows[origin]) {
      return Window.windows[origin];
    }
    Window.windows[origin] = this;
    this.origin = origin;
    this[origin] = this;
  }

  open(url) {
    return Window.windows[url] || new Window(url);
  }

  addEventListener(event, callback) {
    this.on(event, callback);
  }

  removeEventListener(event, callback) {
    this.removeListener(event, callback);
  }

  postMessage(message) {
    this.emit('message', { data: message });
  }
}