import { CoreAgent } from "../CoreAgent";
export declare class Profile extends CoreAgent {
    avatar: string;
    handle: string;
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
}
