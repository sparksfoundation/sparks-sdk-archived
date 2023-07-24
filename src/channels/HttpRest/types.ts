import { ChannelPeer, SparkChannelParams } from "../SparkChannel/types";

export type HttpRestParams = SparkChannelParams & {
  peer: ChannelPeer & {
    url: Window['location']['href'],
  },
}