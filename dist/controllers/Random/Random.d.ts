import { ImportArgs, InceptionArgs, RotationArgs } from '../Controller/types';
import { Controller } from "../Controller/Controller";
export declare class Random extends Controller {
    private randomKeyPairs;
    incept(args: InceptionArgs): Promise<void>;
    rotate(args: RotationArgs): Promise<void>;
    import(args: ImportArgs): Promise<void>;
}
