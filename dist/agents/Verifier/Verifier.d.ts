import { AAgent } from "../Agent/types";
import { IVerifier } from "./types";
export declare class Verifier extends AAgent implements IVerifier {
    verifyEventLog(eventLog: any): Promise<any>;
}
