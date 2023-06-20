import { Agent } from "../Agent";
export declare class Verifier extends Agent {
    /**
   * Verifies the data integrity and key commitment of the entire event log
   * @param eventLog
   * @returns
   */
    verifyEventLog(eventLog: any): Promise<any>;
}
