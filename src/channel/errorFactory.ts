import { ChannelType } from "./types";


export class ChannelErrorFactory {
    private channel: ChannelType;
    constructor(channel) {
        this.channel = channel;
    }
}