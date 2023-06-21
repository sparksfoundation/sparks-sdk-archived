import { AController } from '../Controller/types';
import { IPassword } from './types';
export declare class Password extends AController implements IPassword {
    incept({ password, backers }: Parameters<IPassword['incept']>[0]): ReturnType<IPassword['incept']>;
    import({ password, salt, data }: Parameters<IPassword['import']>[0]): ReturnType<IPassword['import']>;
    export(): Promise<{
        data: string;
        salt: string;
    }>;
    rotate({ password, newPassword, backers }: Parameters<IPassword['rotate']>[0]): ReturnType<IPassword['rotate']>;
    delete(args: Parameters<IPassword['delete']>[0]): ReturnType<IPassword['delete']>;
    private getSaltInput;
    private inceptionEventSigningKeys;
    private inceptionOnly;
    private getLastEvent;
    private getInceptionEvent;
}
