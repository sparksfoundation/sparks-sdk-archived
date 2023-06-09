import BaseIdentity from './BaseIdentity.js';

declare function CastingAgent({ agents, encrypt, hash, sign, derive, channels }: {
    agents?: Function[];
    encrypt?: Function;
    hash?: Function;
    sign?: Function;
    derive?: Function;
    channels?: Function[];
}): typeof BaseIdentity;

export { CastingAgent as default };
