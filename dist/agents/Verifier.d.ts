declare const Verifier: {
    (Base: any): {
        new (...args: any[]): {
            [x: string]: any;
            /**
             * Verifies the data integrity and key commitment of the entire event log
             * @param eventLog
             * @returns
             */
            verifyEventLog(eventLog: any): any;
        };
        [x: string]: any;
    };
    type: string;
    dependencies: {
        hash: boolean;
        sign: boolean;
    };
};

export { Verifier as default };
