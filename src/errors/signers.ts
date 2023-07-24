import { createEvent } from "../events/SparkEvent";

export const SignerErrorTypes = {
  SIGNER_PUBLICKEY_ERROR: 'SIGNER_PUBLICKEY_ERROR',
  SIGNER_SECRETKEY_ERROR: 'SIGNER_SECRETKEY_ERROR',
  SIGNER_KEYPAIR_ERROR: 'SIGNER_KEYPAIR_ERROR',
  SIGNER_SEAL_ERROR: 'SIGNER_SEAL_ERROR',
  SIGNER_SIGNATURE_ERROR: 'SIGNER_SIGNATURE_ERROR',
  SIGNER_SIGNING_ERROR: 'SIGNER_SIGNING_ERROR',
  SIGNER_VERIFY_SIGNATURE_ERROR: 'SIGNER_VERIFY_SIGNATURE_ERROR',
  SIGNER_OPEN_SEAL_ERROR: 'SIGNER_OPEN_SEAL_ERROR',
  SIGNER_INVALID_SALT_ERROR: 'SIGNER_INVALID_SALT_ERROR',
  SIGNER_UNEXPECTED_ERROR: 'SIGNER_UNEXPECTED_ERROR',
} as const;

export const SignerErrors = {
  SIGNER_PUBLICKEY_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_PUBLICKEY_ERROR,
    metadata: { ...metadata },
    data: { message: 'Failed to generate public key.' }
  }),
  SIGNER_SECRETKEY_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_SECRETKEY_ERROR,
    metadata: { ...metadata },
    data: { message: 'Failed to generate secret key.' }
  }),
  SIGNER_KEYPAIR_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_KEYPAIR_ERROR,
    metadata: { ...metadata },
    data: { message: 'Failed to generate key pair.' }
  }),
  SIGNER_SEAL_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_SEAL_ERROR,
    metadata: { ...metadata },
    data: { message: 'Failed to seal data.' }
  }),
  SIGNER_SIGNATURE_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_SIGNATURE_ERROR,
    metadata: { ...metadata },
    data: { message: 'Invalid signature.' }
  }),
  SIGNER_SIGNING_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_SIGNING_ERROR,
    metadata: { ...metadata },
    data: { message: 'Failed to sign data.' }
  }),
  SIGNER_INVALID_SALT_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_INVALID_SALT_ERROR,
    metadata: { ...metadata },
    data: { message: 'Missing password salt.' }
  }),
  SIGNER_OPEN_SEAL_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_OPEN_SEAL_ERROR,
    metadata: { ...metadata },
    data: { message: 'Failed to open seal.' }
  }),
  SIGNER_VERIFY_SIGNATURE_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_VERIFY_SIGNATURE_ERROR,
    metadata: { ...metadata },
    data: { message: 'Failed to verify signature.' }
  }),
  SIGNER_UNEXPECTED_ERROR: ({ metadata = {}, message }: { metadata?: Record<string, any>, message?: string } = {}) => createEvent({
    type: SignerErrorTypes.SIGNER_UNEXPECTED_ERROR,
    metadata: { ...metadata },
    data: { message: message || 'Unexpected signer error.' }
  }),
}

