type MessagePayload = any;

interface EventHandler<T> {
  resolve: (data: T) => void;
  reject: (error: Error) => void;
}

class Channel {
  private _openRequestHandlers = new Map<string, EventHandler<MessagePayload>>();
  private _openReceiptHandlers = new Map<string, EventHandler<MessagePayload>>();
  private _closeRequestHandlers = new Map<string, EventHandler<MessagePayload>>();
  private _closeReceiptHandlers = new Map<string, EventHandler<MessagePayload>>();
  private _messageHandlers = new Map<string, EventHandler<MessagePayload>>();
  private _messageReceiptHandlers = new Map<string, EventHandler<MessagePayload>>();

  public onmessage: ((payload: MessagePayload) => void) | null = null;
  public onopen: (() => void) | null = null;
  public onerror: ((error: Error) => void) | null = null;


  private _randomId() {
    return Math.random().toString(36).substring(2, 10);
  }

  public open(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const eventId = this._randomId();

      const openReceiptHandler: EventHandler<MessagePayload> = {
        resolve: (data) => {
          this._openReceiptHandlers.delete(eventId);
          resolve(data);
        },
        reject: (error) => {
          if (this.onerror) {
            this.onerror(error);
          }
          this._openReceiptHandlers.delete(eventId);
          reject(error);
        }
      };

      this._openReceiptHandlers.set(eventId, openReceiptHandler);

      const openRequestHandler: EventHandler<MessagePayload> = {
        resolve: (data) => {
          this._openRequestHandlers.delete(eventId);
          const receiptPayload = { type: 'open_receipt', eventId: this._randomId() };
          this._sendMessage(receiptPayload);
          resolve(data);
        },
        reject: (error) => {
          if (this.onerror) {
            this.onerror(error);
          }
          this._openRequestHandlers.delete(eventId);
          reject(error);
        }
      };

      this._openRequestHandlers.set(eventId, openRequestHandler);

      const requestPayload = { type: 'open_request', eventId: this._randomId() };
      this._sendMessage(requestPayload);
    });
  }

  public close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const eventId = this._randomId();

      const closeReceiptHandler: EventHandler<MessagePayload> = {
        resolve: (data) => {
          this._closeReceiptHandlers.delete(eventId);
          resolve(data);
        },
        reject: (error) => {
          if (this.onerror) {
            this.onerror(error);
          }
          this._closeReceiptHandlers.delete(eventId);
          reject(error);
        }
      };

      this._closeReceiptHandlers.set(eventId, closeReceiptHandler);

      const closeRequestHandler: EventHandler<MessagePayload> = {
        resolve: (data) => {
          this._closeRequestHandlers.delete(eventId);
          const receiptPayload = { type: 'close_receipt', eventId: this._randomId() };
          this._sendMessage(receiptPayload);
          resolve(data);
        },
        reject: (error) => {
          if (this.onerror) {
            this.onerror(error);
          }
          this._closeRequestHandlers.delete(eventId);
          reject(error);
        }
      };

      this._closeRequestHandlers.set(eventId, closeRequestHandler);

      const requestPayload = { type: 'open_request', eventId: this._randomId() };
      this._sendMessage(requestPayload);
    });
  }

  public send(payload: MessagePayload): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const eventId = this._randomId();

      const receiptHandler: EventHandler<MessagePayload> = {
        resolve: (data) => {
          this._messageReceiptHandlers.delete(eventId);
          resolve(data);
        },
        reject: (error) => {
          if (this.onerror) {
            this.onerror(error);
          }
          this._messageReceiptHandlers.delete(eventId);
          reject(error);
        }
      };

      this._messageReceiptHandlers.set(eventId, receiptHandler);

      const messageHandler: EventHandler<MessagePayload> = {
        resolve: (data) => {
          this._messageHandlers.delete(eventId);
          const receiptPayload = { type: 'message_receipt', eventId: this._randomId() };
          this._sendMessage(receiptPayload);
          resolve(data);
        },
        reject: (error) => {
          if (this.onerror) {
            this.onerror(error);
          }
          this._messageHandlers.delete(eventId);
          reject(error);
        }
      };

      this._messageHandlers.set(eventId, messageHandler);

      const messagePayload = { type: 'message', eventId, payload };
      this._sendMessage(messagePayload);
    });
  }

  private _sendMessage(payload: MessagePayload) {
    // Placeholder for the protocol-specific message sending implementation
    // Developer extending this class should provide the implementation for the specific protocol
    throw new Error('sendMessage method not implemented');
  }

  private _receiveMessage(payload: MessagePayload) {
    // Just as an example... for postMessage, we would do something like this:
    // In the constructor: window.addEventListener('message', this._receiveMessage.bind(this));
    // And then here:

    // Normalize the input event model
    const { type, eventId } = payload;

    if (type === 'open_request') {
      const handler = this._openRequestHandlers.get(eventId);
      if (handler) {
        handler.resolve(payload);
      }
    } else if (type === 'open_receipt') {
      const handler = this._openReceiptHandlers.get(eventId);
      if (handler) {
        handler.resolve(payload);
      }
    } else if (type === 'open_request_error') {
      const handler = this._openRequestHandlers.get(eventId);
      if (handler) {
        handler.reject(payload);
      }
    } else if (type === 'open_receipt_error') {
      const handler = this._openReceiptHandlers.get(eventId);
      if (handler) {
        handler.reject(payload);
      }
    }
  }

  static receive() {
    // Placeholder for the protocol-specific message receiving implementation
    // Developer extending this class should provide the implementation for the specific protocol
    throw new Error('receive method not implemented');
  }
}
