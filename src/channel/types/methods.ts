import { SparkError } from "../../common/errors"
import { ChannelCloseConfirmationEvent, ChannelMessageConfirmationEvent, ChannelMessageEvent, ChannelOpenAcceptanceEvent, ChannelOpenConfirmationEvent, ChannelOpenRequestEvent } from "./events"

export type ResolveOpenPromise = (
    params: ChannelOpenAcceptanceEvent | ChannelOpenConfirmationEvent | SparkError
) => ChannelOpenAcceptanceEvent | SparkError

export type ResolveClosePromise = (
    params: ChannelCloseConfirmationEvent | SparkError
) => ChannelCloseConfirmationEvent | SparkError

export type ResolveMessagePromise = (
    params: ChannelMessageConfirmationEvent | SparkError
) => ChannelMessageEvent | SparkError

export type OnOpenRequested = (callback: ({
    event,
    acceptOpen,
    rejectOpen,
}: {
    event: ChannelOpenRequestEvent,
    acceptOpen: () => void | SparkError,
    rejectOpen: () => SparkError,
}) => void) => void;

export type OnOpenAccepted = (callback: ({
    event,
    confirmOpen,
    rejectOpen,
}: {
    event: ChannelOpenAcceptanceEvent,
    confirmOpen: () => void | SparkError,
    rejectOpen: () => SparkError,
}) => void) => void;
