declare const _default: (Base: any, symbols: any) => {
    new (...args: any[]): {
        [x: string]: any;
        incept({ password }: {
            password: any;
        }): Promise<void>;
        rotate({ password, newPassword }: {
            password: string;
            newPassword?: string | undefined;
        }): any;
    };
    [x: string]: any;
};

export { _default as default };
