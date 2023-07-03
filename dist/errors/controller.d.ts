import { SparkError, SparkErrorParams } from "./SparkError";
export declare enum ControllerErrorName {
    GET_IDENTIFIER_ERROR = "GET_IDENTIFIER_ERROR",
    GET_KEY_EVENT_LOG_ERROR = "GET_KEY_EVENT_LOG_ERROR",
    INCEPTION_ERROR = "INCEPTION_ERROR",
    ROTATION_ERROR = "ROTATION_ERROR",
    DESTROY_ERROR = "DESTROY_ERROR",
    KEY_EVENT_CREATION_ERROR = "KEY_EVENT_CREATION_ERROR",
    SPARK_INSTANCE_ALREADY_SET = "SPARK_INSTANCE_ALREADY_SET"
}
export declare class ControllerErrors {
    static GetIdentifierError({ metadata, stack }?: SparkErrorParams): SparkError;
    static GetKeyEventLogError({ metadata, stack }?: SparkErrorParams): SparkError;
    static InceptionError({ metadata, stack }?: SparkErrorParams): SparkError;
    static RotationError({ metadata, stack }?: SparkErrorParams): SparkError;
    static DestroyError({ metadata, stack }?: SparkErrorParams): SparkError;
    static KeyEventCreationError({ metadata, stack }?: SparkErrorParams): SparkError;
    static SparkInstanceAlreadySet({ metadata, stack }?: SparkErrorParams): SparkError;
}
