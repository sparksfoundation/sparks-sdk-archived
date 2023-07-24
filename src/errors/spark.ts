import { createEvent } from "../events/SparkEvent";

export const SparkErrorTypes = {
  SPARK_IMPORT_ERROR: 'SPARK_IMPORT_ERROR',
  SPARK_EXPORT_ERROR: 'SPARK_EXPORT_ERROR',
  SPARK_UNEXPECTED_ERROR: 'SPARK_UNEXPECTED_ERROR',
} as const;

export const SparkErrors = {
  SPARK_IMPORT_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: SparkErrorTypes.SPARK_IMPORT_ERROR,
    metadata: { ...metadata },
    data: { message: 'Failed to import data.' }
  }),
  SPARK_EXPORT_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: SparkErrorTypes.SPARK_EXPORT_ERROR,
    metadata: { ...metadata },
    data: { message: 'Failed to export data.' }
  }),
  SPARK_UNEXPECTED_ERROR: ({ metadata = {}, message }: { metadata?: Record<string, any>, message?: string } = {}) => createEvent({
    type: SparkErrorTypes.SPARK_UNEXPECTED_ERROR,
    metadata: { ...metadata },
    data: { message: message || 'Unexpected spark error.' }
  }),
}

