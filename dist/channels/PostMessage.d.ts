declare const PostMessage: {
    (Base: any): {
        new (...args: any[]): {
            [x: string]: any;
        };
        [x: string]: any;
    };
    type: string;
    dependencies: {
        encrypt: boolean;
        hash: boolean;
        sign: boolean;
    };
};

export { PostMessage as default };
