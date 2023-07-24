import { ChannelPeer, SparkChannelParams } from "../SparkChannel/types"

export type HttpFetchParams = SparkChannelParams & {
  peer: ChannelPeer & {
    url: Window['location']['href'],
  },
}