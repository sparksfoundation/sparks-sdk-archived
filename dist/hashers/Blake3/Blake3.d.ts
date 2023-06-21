import { IBlake3 } from "./types";
import { AHasher } from "../Hasher";
export declare class Blake3 extends AHasher implements IBlake3 {
    hash(data: any): Promise<any>;
}
