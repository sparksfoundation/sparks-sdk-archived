import { Backers, IController } from "../Controller";
export interface IPassword {
    incept({ password, backers }: {
        password: string;
        backers?: Backers;
    }): ReturnType<IController['import']>;
    import({ password, salt, data }: {
        password: string;
        salt: string;
        data: string;
    }): ReturnType<IController['import']>;
    rotate({ password, newPassword, backers }: {
        password: string;
        newPassword?: string;
        backers?: Backers;
    }): ReturnType<IController['import']>;
    delete(args?: {
        backers?: Backers;
    }): ReturnType<IController['import']>;
    export(args?: {}): ReturnType<IController['export']>;
}
