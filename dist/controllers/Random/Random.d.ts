import { AController } from '../Controller';
import { IRandom } from './types';
export declare class Random extends AController implements IRandom {
    private randomKeys;
    constructor(args: any);
    incept(args: {
        backers?: Parameters<IRandom['incept']>[0]['backers'];
    }): Promise<void>;
    rotate(args: {
        backers?: Parameters<IRandom['rotate']>[0]['backers'];
    }): Promise<void>;
    delete(args: {
        backers?: Parameters<IRandom['delete']>[0]['backers'];
    }): Promise<void>;
    import({ data }: {
        data: any;
    }): Promise<void>;
    export(): Promise<void>;
}
