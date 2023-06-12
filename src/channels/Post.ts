import { Channel, ChannelManager } from "./Channel";
import { CloseChannelArgs, IChannelManager, OpenChannelArgs } from "./types";

enum PostMessageEventTypes {
    OPEN_REQUEST = 'spark-channel:open-request',
    OPEN_CONFIRMATION = 'spark-channel:open-confirmation',
    CLOSE_REQUEST = 'spark-channel:close-request',
    CLOSE_CONFIRMATION = 'spark-channel:close-confirmation',
    MESSAGE = 'spark-channel:message',
    MESSAGE_RECEIPT = 'spark-channel:message-receipt',
    ERROR = 'spark-channel:error',
}

type PostMessageEvent = MessageEvent & {
    data: {
        cid?: string;
        mid?: string;
        type: string;
        payload: any;
    }
}

export class PostChannelManager extends ChannelManager implements IChannelManager {
    private handler: (event: PostMessageEvent) => void;
    private whitelist: string[] = [];
    public channels: Channel[] = [];

    constructor(args) {
        super(args);

        const handleOpenRequest = (event: PostMessageEvent):any => {
            // if there's no channel id, target or publicKey, return
            
            // if the channel id already exists, return
            



        };

        const handleOpenConfirmation = (event: PostMessageEvent):any => {

        };

        const handleCloseRequest = (event: PostMessageEvent):any => {

        };

        const handleCloseConfirmation = (event: PostMessageEvent):any => {

        };

        const handleMessage = (event: PostMessageEvent):any => {

        };

        const handleMessageReceipt = (event: PostMessageEvent):any => {

        };

        const handleError = (event: PostMessageEvent):any => {

        };

        this.handler = (event: PostMessageEvent):any => {
            const { data = {} } = event;
            const { cid, mid, type, payload } = data || {};
            if (!type || !payload || !(cid || mid)) return;
            if (type === PostMessageEventTypes.OPEN_REQUEST) {
                handleOpenRequest(event);
            } else if (type === PostMessageEventTypes.OPEN_CONFIRMATION) {
                handleOpenConfirmation(event);
            } else if (type === PostMessageEventTypes.CLOSE_REQUEST) {
                handleCloseRequest(event);
            } else if (type === PostMessageEventTypes.CLOSE_CONFIRMATION) {
                handleCloseConfirmation(event);
            } else if (type === PostMessageEventTypes.MESSAGE) {
                handleMessage(event);
            } else if (type === PostMessageEventTypes.MESSAGE_RECEIPT) {
                handleMessageReceipt(event);
            } else if (type === PostMessageEventTypes.ERROR) {
                handleError(event);
            }
        }

        window.addEventListener('message', this.handler);
        window.addEventListener('beforeunload', () => this.close({ receipt: false }));
    }

    public async open(args: OpenChannelArgs): Promise<void> {
        const { target, receipt, beforeOpen, onOpen, onMessage, onClose, onError } = args;
        console.log(args)
        return Promise.resolve();
    }

    public async close(args: CloseChannelArgs): Promise<void> {
        window.removeEventListener('message', this.handler);
        return Promise.resolve();
    }

}