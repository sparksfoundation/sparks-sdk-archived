type KeriEvent = {
    identifier: string;
    eventIndex: string;
    eventType: string;
    signingThreshold: string;
    signingKeys: Array<string>;
    nextKeyCommitments: Array<string>;
    backerThreshold: string;
    backers: Array<string>;
};
type KeriSAIDEvent = KeriEvent & {
    selfAddressingIdentifier: string;
    version: string;
};
declare abstract class BaseIdentity {
    abstract encrypt({ publicKey, data }: {
        sharedKey?: string;
        publicKey?: string;
        data: string;
    }): string;
    abstract decrypt({ publicKey, data }: {
        sharedKey?: string;
        publicKey?: string;
        data: string;
    }): string;
    abstract sign({ data, detached }: {
        data: string;
        detached: boolean;
    }): string;
    abstract verify({ publicKey, signature, data }: {
        publicKey: string;
        signature: string;
        data: string | object;
    }): void;
    abstract hash(data: string): string;
    protected identifier: string | null;
    protected keyPairs: any;
    protected keyEventLog: any[];
    constructor();
    protected get publicKeys(): {
        signing: any;
        encryption: any;
    } | null;
    /**
     * Incept a new identity.
     * @param {object} keyPairs - The key pairs to use for the inception event.
     * @param {object} nextKeyPairs - The next key pairs to use for the next key commitment.
     * @param {string[]} backers - The list of backers to use for the inception event.
     * @throws {Error} If the identity has already been incepted.
     * @throws {Error} If no key pairs are provided.
     * @throws {Error} If no next key pairs are provided.
     * @todo -- add the receipt request and processing
     */
    incept({ keyPairs, nextKeyPairs, backers }: {
        keyPairs: any;
        nextKeyPairs: any;
        backers?: string[];
    }): void;
    /**
     * Rotate the keys of an identity.
     * @param {object} keyPairs - The key pairs to use for the rotation event.
     * @param {object} nextKeyPairs - The next key pairs to use for the next key commitment.
     * @param {string[]} backers - The list of backers to use for the rotation event.
     * @returns {object} The rotation event.
     * @throws {Error} If the identity has not been incepted.
     * @throws {Error} If no key pairs are provided.
     * @throws {Error} If no next key pairs are provided.
     * @throws {Error} If the identity has been destroyed.
     * @todo -- add the receipt request and processing
     */
    rotate({ keyPairs, nextKeyPairs, backers }: {
        keyPairs: any;
        nextKeyPairs: any;
        backers?: string[];
    }): void;
    createEvent({ identifier, eventIndex, eventType, signingThreshold, publicSigningKey, nextKeyHash, backerThreshold, backers, }: {
        identifier: string;
        eventIndex: string;
        eventType: string;
        signingThreshold: string;
        publicSigningKey: string;
        nextKeyHash: string;
        backerThreshold: string;
        backers: Array<string>;
    }): KeriSAIDEvent;
    /**
     * Destroy an identity.
     * @param {string[]} backers - The list of backers to use for the destruction event.
     * @returns {object} The destruction event.
     * @throws {Error} If the identity has not been incepted.
     * @throws {Error} If the identity has been destroyed.
     * @todo -- add the receipt request and processing
     */
    destroy(args?: {
        backers?: string[];
    }): void;
    import({ keyPairs, data }: {
        keyPairs: any;
        data: string;
    }): void;
    /**
     * Export an identity, excluding the key pairs.
     */
    export(): string;
    /**
     * Helper to get the class hierarchy of the current instance.
     * @returns {string[]} - The class hierarchy of the current instance.
     */
    is(): string[];
}

export { BaseIdentity as default };
