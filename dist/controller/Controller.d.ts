import { ControllerInterface, ErrorInterface, Identifier, KeyDestructionEvent, KeyEventLog, KeyInceptionEvent, KeyRotationEvent } from "../types";
export declare class Controller implements ControllerInterface {
    destroy(...args: any): Promise<ErrorInterface | KeyDestructionEvent>;
    get identifier(): Identifier | ErrorInterface;
    get keyEventLog(): KeyEventLog | ErrorInterface;
    incept(...args: any): Promise<ErrorInterface | KeyInceptionEvent>;
    rotate(...args: any): Promise<ErrorInterface | KeyRotationEvent>;
}
