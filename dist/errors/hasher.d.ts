import { SparkError, SparkErrorParams } from "./SparkError";
export declare enum HasherErrorType {
    HASHING_ERROR = "HASHING_ERROR"
}
export declare class HasherErrors {
    static HashingFailure({ metadata, stack }?: SparkErrorParams): SparkError;
}
