
export class Channel {
  protected spark;
  static receive: (callback: (data: any) => void, context: any, _window: any) => void;
  constructor(spark) {
    this.spark = spark;
  }
}
