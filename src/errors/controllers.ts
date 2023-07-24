import { createEvent } from "../events/SparkEvent";

export const ControllerErrorTypes = {
  CONTROLLER_ALREADY_INCEPTED_ERROR: 'CONTROLLER_ALREADY_INCEPTED_ERROR',
  CONTROLLER_INCEPTION_MISSING_ERROR: 'CONTROLLER_INCEPTION_MISSING_ERROR',
  CONTROLLER_ALREADY_DESTROYED_ERROR: 'CONTROLLER_ALREADY_DESTROYED_ERROR',
  CONTROLLER_INVALID_NEXT_KEYPAIRS_ERROR: 'CONTROLLER_INVALID_NEXT_KEYPAIRS_ERROR',
  CONTROLLER_INVALID_KEY_EVENT_TYPE_ERROR: 'CONTROLLER_INVALID_KEY_EVENT_TYPE_ERROR',
  CONTROLLER_INVALID_NEXT_KEY_COMMITMENT_ERROR: 'CONTROLLER_INVALID_NEXT_KEY_COMMITMENT_ERROR',
  CONTROLLER_MISSING_PREVIOUS_DIGEST_ERROR: 'CONTROLLER_MISSING_PREVIOUS_DIGEST_ERROR',
  CONTROLLER_MISSING_IDENTIFIER_ERROR: 'CONTROLLER_MISSING_IDENTIFIER_ERROR',
  CONTROLLER_UNEXPECTED_ERROR: 'CONTROLLER_UNEXPECTED_ERROR',
} as const;

export const ControllerErrors = {
  CONTROLLER_ALREADY_INCEPTED_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_ALREADY_INCEPTED_ERROR,
    metadata: { ...metadata },
    data: { message: 'Controller already incepted.' }
  }),
  CONTROLLER_INCEPTION_MISSING_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_INCEPTION_MISSING_ERROR,
    metadata: { ...metadata },
    data: { message: 'Missing controller inception.' }
  }),
  CONTROLLER_ALREADY_DESTROYED_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_ALREADY_DESTROYED_ERROR,
    metadata: { ...metadata },
    data: { message: 'Controller already destroyed.' }
  }),
  CONTROLLER_INVALID_NEXT_KEYPAIRS_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_INVALID_NEXT_KEYPAIRS_ERROR,
    metadata: { ...metadata },
    data: { message: 'Invalid next keypairs.' }
  }),
  CONTROLLER_INVALID_KEY_EVENT_TYPE_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_INVALID_KEY_EVENT_TYPE_ERROR,
    metadata: { ...metadata },
    data: { message: 'Invalid key event type.' }
  }),
  CONTROLLER_INVALID_NEXT_KEY_COMMITMENT_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_INVALID_NEXT_KEY_COMMITMENT_ERROR,
    metadata: { ...metadata },
    data: { message: 'Invalid next key commitment.' }
  }),
  CONTROLLER_MISSING_PREVIOUS_DIGEST_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_MISSING_PREVIOUS_DIGEST_ERROR,
    metadata: { ...metadata },
    data: { message: 'Missing previous key event digest.' }
  }),
  CONTROLLER_MISSING_IDENTIFIER_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_MISSING_IDENTIFIER_ERROR,
    metadata: { ...metadata },
    data: { message: 'Missing controller identifier.' }
  }),
  CONTROLLER_UNEXPECTED_ERROR: ({ metadata = {}, message }: { metadata?: Record<string, any>, message?: string } = {}) => createEvent({
    type: ControllerErrorTypes.CONTROLLER_UNEXPECTED_ERROR,
    metadata: { ...metadata },
    data: { message: message || 'Unexpected controller error.' }
  }),
}