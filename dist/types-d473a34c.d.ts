interface SparkAgentInterface {
    import(data: Record<string, any>): Promise<void>;
    export(): Promise<Record<string, any>>;
}

export { SparkAgentInterface as S };
