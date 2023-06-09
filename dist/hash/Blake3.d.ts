declare const Blake3: {
    (Base: any): {
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
    type: string;
};

export { Blake3 as default };
