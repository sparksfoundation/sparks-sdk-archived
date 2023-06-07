declare const _default: (Base: any) => {
    new (...args: any[]): {
        [x: string]: any;
        /**
         * Computes a shared key using X25519SalsaPoly
         * @param {string} publicKey
         * @returns {string} sharedKey
         */
        sharedKey({ publicKey }: {
            publicKey: string;
        }): string;
        /**
         * Encrypts data using X25519SalsaPoly
         * @param {object|string} data
         * @param {string} publicKey
         * @param {string} sharedKey
         * @returns {string}
         */
        encrypt({ data, publicKey, sharedKey }: {
            data: object | string;
            publicKey?: string | undefined;
            sharedKey?: string | undefined;
        }): string;
        /**
         * Decrypts data using X25519SalsaPoly
         * @param {string} data
         * @param {string} publicKey
         * @param {string} sharedKey
         * @returns {string}
         */
        decrypt({ data, publicKey, sharedKey }: {
            data: string;
            publicKey?: string | undefined;
            sharedKey?: string | undefined;
        }): string;
    };
    [x: string]: any;
};

export { _default as default };
