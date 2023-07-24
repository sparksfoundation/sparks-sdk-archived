import { createEvent } from "../events/SparkEvent";

export const AgentErrorTypes = {
  AGENT_INVALID_TYPE_ERROR: 'AGENT_INVALID_TYPE_ERROR',
  AGENT_UNEXPECTED_ERROR: 'AGENT_UNEXPECTED_ERROR',
} as const;

export const AgentErrors = {
  AGENT_INVALID_TYPE_ERROR: ({ metadata = {} }: { metadata?: Record<string, any> } = {}) => createEvent({
    type: AgentErrorTypes.AGENT_INVALID_TYPE_ERROR,
    metadata: { ...metadata },
    data: { message: 'Invalid agent type.' }
  }),
  AGENT_UNEXPECTED_ERROR: ({ metadata = {}, message }: { metadata?: Record<string, any>, message?: string } = {}) => createEvent({
    type: AgentErrorTypes.AGENT_INVALID_TYPE_ERROR,
    metadata: { ...metadata },
    data: { message: message || 'Unexpected agent type.' }
  }),
}

