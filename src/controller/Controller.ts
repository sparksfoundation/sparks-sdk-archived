import { SparkError } from "../errors";
import { ControllerInterface, ErrorInterface, ErrorType, Identifier, KeyDestructionEvent, KeyEventLog, KeyInceptionEvent, KeyRotationEvent } from "../types";

export class Controller implements ControllerInterface {
    public destroy(...args: any): Promise<ErrorInterface | KeyDestructionEvent> {
        return Promise.reject(new SparkError({
            message: 'Not implemented',
            type: ErrorType.Generic.UNEXPECTED
        }))
    }

    public get identifier(): Identifier | ErrorInterface {
        return this.identifier;
    }

    public get keyEventLog(): KeyEventLog | ErrorInterface {
        return this.keyEventLog;
    }

    public incept(...args: any): Promise<ErrorInterface | KeyInceptionEvent> {
        return Promise.reject(new SparkError({
            message: 'Not implemented',
            type: ErrorType.Generic.UNEXPECTED
        }))
    }

    public rotate(...args: any): Promise<ErrorInterface | KeyRotationEvent> {
        return Promise.reject(new SparkError({
            message: 'Not implemented',
            type: ErrorType.Generic.UNEXPECTED
        }))
    }
}