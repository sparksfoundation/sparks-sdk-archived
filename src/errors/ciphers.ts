import { createEvent } from "../events/SparkEvent";

export const CipherErrorTypes = {
  CIPHER_PUBLICKEY_ERROR: 'CIPHER_PUBLICKEY_ERROR',
  CIPHER_SECRETKEY_ERROR: 'CIPHER_SECRETKEY_ERROR',
  CIPHER_KEYPAIR_ERROR: 'CIPHER_KEYPAIR_ERROR',
  CIPHER_ENCRYPTION_ERROR: 'CIPHER_ENCRYPTION_ERROR',
  CIPHER_DECRYPTION_ERROR: 'CIPHER_DECRYPTION_ERROR',
  CIPHER_SHARED_KEY_ERROR: 'CIPHER_SHARED_KEY_ERROR',
  CIPHER_UNEXPECTED_ERROR: 'CIPHER_UNEXPECTED_ERROR',
} as const;

export const CipherErrors = {
  CIPHER_PUBLICKEY_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: CipherErrorTypes.CIPHER_PUBLICKEY_ERROR,
    metadata: { ...metadata },
    data: { message: 'Failed to generate public key.' }
  }),
  CIPHER_SECRETKEY_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: CipherErrorTypes.CIPHER_SECRETKEY_ERROR,
    metadata: { ...metadata },
    data: { message: 'Failed to generate secret key.' }
  }),
  CIPHER_KEYPAIR_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: CipherErrorTypes.CIPHER_KEYPAIR_ERROR,
    metadata: { ...metadata },
    data: { message: 'Failed to generate key pair.' }
  }),
  CIPHER_ENCRYPTION_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: CipherErrorTypes.CIPHER_ENCRYPTION_ERROR,
    metadata: { ...metadata },
    data: { message: 'Failed to encrypt data.' }
  }),
  CIPHER_DECRYPTION_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: CipherErrorTypes.CIPHER_DECRYPTION_ERROR,
    metadata: { ...metadata },
    data: { message: 'Failed to decrypt data.' }
  }),
  CIPHER_SHARED_KEY_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: CipherErrorTypes.CIPHER_SHARED_KEY_ERROR,
    metadata: { ...metadata },
    data: { message: 'Failed to generate shared key.' }
  }),
  CIPHER_UNEXPECTED_ERROR: ({ metadata = {}, message }: { metadata?: Record<string, any>, message?: string } = {}) => createEvent({
    type: CipherErrorTypes.CIPHER_UNEXPECTED_ERROR,
    metadata: { ...metadata },
    data: { message: message || 'Unexpected cipher error.' }
  }),
}

