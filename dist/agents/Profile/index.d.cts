import { S as SparkAgentInterface } from '../../types-d473a34c.js';

declare abstract class SparkAgent implements SparkAgentInterface {
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
}

declare class Profile extends SparkAgent {
    avatar: string;
    handle: string;
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
}

export { Profile };
