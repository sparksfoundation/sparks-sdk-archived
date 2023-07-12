import { ChannelConfirmEvent, ChannelRequestEvent } from "../ChannelEvent";
import { ChannelActionConfirm, ChannelActionInterface, ChannelActionParams, ChannelActionRequest } from "./types";
import { Spark } from "../../Spark";
import merge from 'lodash.merge';
import { CoreChannel } from "../CoreChannel";
import { ChannelAction } from "./ChannelAction";
import cuid from "cuid";

type Actions = ['MESSAGE'];
const Actions = ['MESSAGE'] as const;

const Events = {
    MESSAGE_REQUEST: 'MESSAGE_REQUEST',
    MESSAGE_CONFIRM: 'MESSAGE_CONFIRM',
    MESSAGE_ERROR: 'MESSAGE_ERROR',
} as const;

export class Message extends ChannelAction<Actions>{
    public readonly name = 'MESSAGE';
    public readonly actions = Actions as Actions;

    public setContext({ spark, channel }: { spark: Spark<any, any, any, any, any>, channel: CoreChannel }) {
        this.spark = spark;
        this.channel = channel;
    }

    public MESSAGE_REQUEST: ChannelActionRequest = async (params) => {
        const type = Events.MESSAGE_REQUEST;
        const data = params?.data || '';
        const metadata = { ...params?.metadata, messageId: cuid(), channelId: this.channel.channelId };
        const request = new ChannelRequestEvent({ type, metadata, data });
        const sealed = await request.seal({
            sharedKey: this.channel.peer.sharedKey,
            cipher: this.spark.cipher,
            signer: this.spark.signer,
        });

        const confirmEvent = await this.channel.dispatchRequest(sealed) as ChannelConfirmEvent<true>;
        return confirmEvent;
    }

    public MESSAGE_CONFIRM: ChannelActionConfirm = async (requestEvent: ChannelRequestEvent<true>) => {
        // const unsealed = await requestEvent.open({
        //     publicKey: this.channel.peer.publicKeys.signer,
        //     sharedKey: this.channel.peer.sharedKey,
        //     cipher: this.spark.cipher,
        //     signer: this.spark.signer,
        // });

        //console.log(unsealed);

        return Promise.resolve(new ChannelConfirmEvent({
            type: Events.MESSAGE_CONFIRM,
            metadata: merge({}, requestEvent?.metadata),
            data: 'confirmed',
        }));
    }
}