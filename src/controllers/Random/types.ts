import { Backers, IController } from "../Controller";

export interface IRandom {
    incept({ backers }: { backers?: Backers }): ReturnType<IController['import']>;
    rotate({ backers }: { backers?: Backers }): ReturnType<IController['import']>;
    delete({ backers }: { backers?: Backers }): ReturnType<IController['import']>;
    import({ data }: { data: string | Record<string, any> }): ReturnType<IController['import']>;
    export(): ReturnType<IController['export']>;
}
