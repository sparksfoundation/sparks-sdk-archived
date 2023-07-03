import { CoreAgent } from "../CoreAgent";

export class Profile extends CoreAgent {
    public avatar: string;
    public handle: string;

    public async import(data: Record<string, any>): Promise<void> {
        this.avatar = data.avatar
        this.handle = data.handle
        return Promise.resolve();
    }

    public async export(): Promise<Record<string, any>> {
        return Promise.resolve({
            avatar: this.avatar,
            handle: this.handle,
        });
    }
}
