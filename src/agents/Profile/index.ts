import { SparkErrors } from "../../errors/spark";
import { SparkAgent } from "../SparkAgent";

export class Profile extends SparkAgent {
  public avatar: string;
  public handle: string;

  public async import(data: Record<string, any>): Promise<void> {
    if (!data) return Promise.resolve();
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
