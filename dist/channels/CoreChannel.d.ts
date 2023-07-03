/**
 * TODO
 * - add _messageQueue logic to handle messages that come in before the channel is opened
 * - add timeouts for open, close and message promises
 * - add max retries for open, close and message attempts
 */
import { Spark } from "../Spark";
import { AnyChannelEvent, ChannelCloseConfirmationEvent, ChannelCloseEvent, ChannelEventLog, ChannelEventType, ChannelId, ChannelMessageConfirmationEvent, ChannelMessageData, ChannelOpenAcceptanceEvent, ChannelOpenConfirmationEvent, ChannelOpenRejectionEvent, ChannelPeer, ChannelState, HandleOpenAccepted, HandleOpenRequested, ChannelType, ChannelListenerOff, ChannelListenerOn } from "./types";
import { EncryptionSharedKey } from "../ciphers/types";
import { SparkError } from "../errors/SparkError";
import { AnyChannelEventWithSource } from "./types";
export declare abstract class CoreChannel {
    private _openPromises;
    private _closePromises;
    private _messagePromises;
    private _messageQueue;
    protected _spark: Spark<any, any, any, any, any>;
    private _cid;
    private _peer;
    private _sharedKey;
    private _status;
    private _eventLog;
    _listeners: Map<ChannelEventType, Map<Function, Function>>;
    static type: ChannelType;
    get type(): ChannelType;
    get cid(): ChannelId;
    get peer(): ChannelPeer;
    get sharedKey(): EncryptionSharedKey;
    get status(): ChannelState;
    get eventLog(): ChannelEventLog;
    constructor({ cid, spark, eventLog, peer }: {
        cid: ChannelId;
        spark: Spark<any, any, any, any, any>;
        save?: boolean;
        eventLog?: ChannelEventLog;
        peer?: ChannelPeer;
    });
    /**
     * PRIVATE UTILITY METHODS
     */
    private _createReceiptDigest;
    private _openReceiptDigest;
    private _createMessageDigest;
    private _openMessageDigest;
    private _createEvent;
    private _setPeer;
    /**
     * PUBLIC CHANNEL METHODS
     * - can be be extended by child classes if needed
     * - should be exposed to user and called directly
     */
    /**
     * @description Sets event listeners for close, message or error events
     * @returns {Function} - a function to remove the listener
     * @throws {INVALID_CALLBACK_EVENT_TYPE}
     */
    on: ChannelListenerOn;
    off: ChannelListenerOff;
    /**
     * @description Initiates opening a channel
     * - sets a promise to be
     *   - resolved w/open confirmation event
     *   - rejected w/open rejection event
     * - creates an open request event and sends it to the peer
     * @throws {OPEN_REQUEST_ERROR}
     * @returns {Promise<ChannelOpenConfirmationEvent>}
     */
    open(): Promise<CoreChannel | ChannelOpenRejectionEvent | SparkError>;
    close(): Promise<ChannelCloseConfirmationEvent | SparkError>;
    message(data: any): Promise<ChannelMessageConfirmationEvent>;
    getLoggedEventMessage(event: AnyChannelEventWithSource): Promise<ChannelMessageData>;
    /**
     * PRIVATE CHANNEL METHODS
     * - should not be extended by child classes
     * - should not be exposed to user
     * - should not be called directly
     */
    /**
     * @description Handles inbound channel open requests
     * - sets up callbacks and passes data to handleOpenRequested
     * @param {ChannelOpenAcceptanceEvent} acceptanceEvent
     * @throws {ON_OPEN_REQUESTED_ERROR}
     */
    private _onOpenRequested;
    /**
     * @description Handles accepting an inbound channel open request
     * - sets the channel's peer and shared key
     * - creates an open acceptance event and sends it to the peer
     * @param {ChannelOpenRequestEvent} requestEvent
     * @returns {Promise<void>}
     * @throws {CONFIRM_OPEN_ERROR}
     */
    private _acceptOpen;
    /**
     * @description Handles rejecting an inbound channel open request
     * - creates an open rejection event and sends it to the peer
     * @param {ChannelOpenRequestEvent} requestEvent
     * @returns {Promise<void>}
     * @throws {REJECT_OPEN_ERROR}
     */
    private _rejectOpen;
    /**
     * @description Handles inbound channel open acceptances
     * - sets up callbacks and passes data to handleOpenAccepted
     * @param {ChannelOpenAcceptanceEvent} acceptanceEvent
     * @throws {ON_OPEN_ACCEPTED_ERROR}
     */
    private _onOpenAccepted;
    /**
     * @description Handles confirming an inbound channel open acceptance
     * - sets the channel's peer and shared key
     * - checks the receipt digest
     * - creates an open confirmation event and sends it to the peer
     * - resolves the open promise with the acceptance event
     * @param {ChannelOpenAcceptanceEvent} acceptanceEvent
     * @throws {CONFIRM_OPEN_ERROR}
     */
    private _confirmOpen;
    /**
     * @description Handles inbound channel open confirmations
     * - checks the receipt digest
     * - resolves the open promise with the confirmation event
     * @param {ChannelOpenConfirmationEvent} confirmationEvent
     * @throws {OPEN_CONFIRMED_ERROR}
     */
    private _onOpenConfirmed;
    /**
     * @description Handles inbound channel open rejections
     * - rejects the open promise with the rejection event
     * @param {ChannelOpenRejectionEvent} rejectionEvent
     * @throws {OPEN_REJECTED_ERROR}
     */
    private _onOpenRejected;
    private _handleOpened;
    private _onClosed;
    private _onCloseConfirmed;
    private _handleClosed;
    private _onMessage;
    private _onMessageConfirmed;
    private _sendRequest;
    private _handleResponse;
    /**
     * PROTECTED METHODS
     * - handleOpenRequested - to be set by extending class (does not call super)
     * - handleOpenAccepted - to be set by extending class (does not call super)
     * - handleResponse - must be overridden and/or called by extending class to handle inbound channel events
     * - handleClosed - optionally overridden by extending class to handle cleanup after channel is closed
     * - handleOpened - optionally overridden by extending class to handle setup after channel is opened
     * - import - must be overridden by extending class to import channel data
     * - export - must be overridden by extending class to export channel data
     */
    /**
   * @description Handles inbound channel open requests
   * - to be overridden by user via extending classes
   * - if not overridden, will resolve the request
   * - resolving triggers _acceptOpen
   * - rejecting triggers _rejectOpen
   */
    protected handleOpenRequested: HandleOpenRequested;
    /**
     * @description Handles inbound channel open acceptances
     * - to be overridden by user via extending classes
     * - if not overridden, will resolve the acceptance
     * - resolving triggers _confirmOpen
     * - rejecting triggers _rejectOpen
     */
    protected handleOpenAccepted: HandleOpenAccepted;
    protected handleResponse(event: AnyChannelEvent): Promise<any>;
    protected handleClosed(closeOrConfirmEvent: ChannelCloseConfirmationEvent | ChannelCloseEvent): void;
    protected handleOpened(openEvent: ChannelOpenConfirmationEvent | ChannelOpenAcceptanceEvent): void;
    protected abstract sendRequest(event: AnyChannelEvent): Promise<void>;
    export(): Promise<Record<string, any>>;
    import(data: Record<string, any>): Promise<void>;
}
