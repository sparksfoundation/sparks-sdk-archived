declare const _default: (Base: any) => {
    new (...args: any[]): {
        [x: string]: any;
        /**
         * Hashes data using blake3
         * @param {string} data
         * @returns {string}
         */
        hash(data: any): string;
    };
    [x: string]: any;
};

export { _default as default };
