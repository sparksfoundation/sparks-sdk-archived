import { ISpark } from '../../Spark';
import { Channel, AChannel, SparksChannel } from '../Channel';

export class RestAPI extends AChannel {
  static promises: Map<string, any> = new Map();
  static receives: Map<string, any> = new Map();
  static requestHandler: Function;

  constructor({ spark, channel }: { spark: ISpark<any, any, any, any, any>, channel: Channel }) {
    super({ spark, channel });
    this.handleResponse = this.handleResponse.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.channel.setSendRequest(this.sendRequest);
    RestAPI.receives.set(this.cid, this.handleResponse);
  }

  protected handleResponse(response) {
    const promise = RestAPI.promises.get(response.eid);
    if (promise) promise.resolve();
    return this.channel.handleResponse(response);
  }

  protected async sendRequest(request) {
    if (!request.eid) return;
    const promise = RestAPI.promises.get(request.eid);
    if (promise) promise.resolve(request);
  }

  static receive(callback, { spark }: { spark: ISpark<any, any, any, any, any> }) {
    if (!spark || !callback) {
      throw new Error('missing required arguments: spark, callback');
    }

    RestAPI.requestHandler = async (request) => {
      return new Promise((resolve, reject) => {
        const { eid, cid, type } = request;
        if (!eid || !cid || !type) {
          return reject({ error: 'Invalid request' });
        }
        
        RestAPI.promises.set(eid, { resolve, reject });
        const receive = RestAPI.receives.get(cid);
        if (receive) return receive(request);

        if (type === SparksChannel.Event.Types.OPEN_REQUEST) {

          const channel = new RestAPI({
            spark,
            channel: new Channel({ spark, cid })
          });

          callback({
            details: request,
            resolve: async () => {
              await channel.acceptOpen(request);
              return channel;
            },
            reject: async () => {
              await channel.rejectOpen(request);
              return null;
            }
          })
        }
      })
    };
  }
}
