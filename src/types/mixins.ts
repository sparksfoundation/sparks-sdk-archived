export enum MixinType {
  CONTROLLER = 'CONTROLLER',
  AGENT = 'AGENT',
  HASH = 'HASH',
  SIGN = 'SIGN',
  DERIVE = 'DERIVE',
  ENCRYPT = 'ENCRYPT',
  CHANNEL = 'CHANNEL',
  STORAGE = 'STORAGE',
}

export type MixinDependencies = {
  agents?: string | string[] | boolean | undefined,
  hash?: string | boolean | undefined,
  sign?: string | boolean | undefined,
  derive?: string | boolean | undefined,
  encrypt?: string | boolean | undefined,
  channels?: string | boolean | undefined,
}
