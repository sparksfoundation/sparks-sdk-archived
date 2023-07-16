import { ChannelPeer, CoreChannelParams } from "../../types";
export type HttpRestParams = CoreChannelParams & {
    peer: ChannelPeer & {
        url: Window['location']['href'];
    };
};
