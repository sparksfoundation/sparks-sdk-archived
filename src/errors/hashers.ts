import { createEvent } from "../events/SparkEvent";

export const HasherErrorTypes = {
  HASING_ERROR: 'HASING_ERROR',
  HASHER_UNEXPECTED_ERROR: 'HASHER_UNEXPECTED_ERROR',
} as const;

export const HasherErrors = {
  HASING_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: HasherErrorTypes.HASING_ERROR,
    metadata: { ...metadata },
    data: { message: 'Failed to hash data.' }
  }),
  HASHER_UNEXPECTED_ERROR: ({ metadata = {}, message }: { metadata?: Record<string, any>, message?: string } = {}) => createEvent({
    type: HasherErrorTypes.HASHER_UNEXPECTED_ERROR,
    metadata: { ...metadata },
    data: { message: message || 'Unexpected hasher error.' }
  }),
}

