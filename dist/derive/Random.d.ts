declare const Random: {
    (Base: any): {
        new (...args: any[]): {
            [x: string]: any;
            "__#1@#randomKeyPairs": any[];
            incept(): void;
            rotate(): void;
        };
        [x: string]: any;
    };
    type: string;
};

export { Random as default };
