import { Controller } from '../Controller/Controller';
import { InceptionArgs, KeyEventLog, RotationArgs } from '../Controller/types';
export declare class Password extends Controller {
    incept(args: InceptionArgs): Promise<void>;
    import(args: any): Promise<void>;
    export(): Promise<{
        data: string;
        salt: string;
    }>;
    rotate(args: RotationArgs): any;
    getSaltInput(kel: KeyEventLog): string | import("../Controller/types").KeriInceptionEvent | import("../Controller/types").KeriRotationEvent;
    inceptionEventSigningKeys(kel: KeyEventLog): string;
    inceptionOnly(kel: KeyEventLog): boolean;
    getLastEvent(kel: KeyEventLog): import("../Controller/types").KeriInceptionEvent | import("../Controller/types").KeriRotationEvent;
    getInceptionEvent(kel: KeyEventLog): import("../Controller/types").KeriInceptionEvent | import("../Controller/types").KeriRotationEvent;
}
