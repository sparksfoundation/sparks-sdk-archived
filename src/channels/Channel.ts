export class Channel {
  protected spark;
  public cid;
  public sharedKey;
  public target;
  public receipt;
  constructor({ spark, cid, sharedKey, target, receipt }) {
    this.spark = spark;
    this.cid = cid;
    this.sharedKey = sharedKey;
    this.target = target;
    this.receipt = receipt;
  }
}

export class ChannelManager {
  protected spark;
  constructor(spark) {
    this.spark = spark;
  }
}