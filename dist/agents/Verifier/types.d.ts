import { KeyEventLog } from "../../controllers";
export interface IVerifier {
    verifyEventLog(eventLog: KeyEventLog): Promise<boolean>;
}
