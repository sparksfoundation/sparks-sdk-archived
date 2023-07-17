import { ChannelPeer, CoreChannelParams } from "../../types";
export type HttpFetchParams = CoreChannelParams & {
    peer: ChannelPeer & {
        url: Window['location']['href'];
    };
};
