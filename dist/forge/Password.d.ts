declare const _default: (Base: any) => {
    new (...args: any[]): {
        [x: string]: any;
        incept({ password }: {
            password: any;
        }): Promise<void>;
        import({ password, salt, data }: {
            password: any;
            salt: any;
            data: any;
        }): Promise<void>;
        export(): Promise<{
            data: any;
            salt: string;
        }>;
        rotate({ password, newPassword }: {
            password: string;
            newPassword?: string | undefined;
        }): any;
    };
    [x: string]: any;
};

export { _default as default };
