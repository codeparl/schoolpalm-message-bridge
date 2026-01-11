export interface HandshakeReadyPayload {
  version: string
  timestamp: number
    capabilities?: string[]
}

export interface ModuleStartPayload {
  moduleId: string
  route: string
  context: Record<string, any>
  timestamp: number
}

export interface ModuleExitPayload {
  reason?: string
}

export interface UIUpdatePayload {
  title: string
  breadcrumb: string[]
  theme?: string
}

export interface ErrorPayload {
  code: string
  message: string
  details?: any
}

export interface ModuleContextPayload {
  user?: Record<string, any>
  tenant?: Record<string, any>
  permissions?: string[]
  theme?: string
}

export interface RequestPayload {
  requestId: string
  type: string
  payload?: any
}

export interface ResponsePayload {
  requestId: string
  status: 'success' | 'error'
  payload?: any
  error?: string
}


/**
 * Payload for heartbeat messages.
 * Host ↔ Module
 */
export interface HeartbeatPayload {
  timestamp: number
  ack?: boolean
}

export type MessagePayload =
  | HandshakeReadyPayload
  | ModuleStartPayload
  | ModuleExitPayload
  | UIUpdatePayload
  | ErrorPayload
  | ModuleContextPayload
  | RequestPayload
  | ResponsePayload
  | HeartbeatPayload


import { MessageType } from './messageTypes'

export interface MessagePayloadMap {
  [MessageType.HANDSHAKE_READY]: HandshakeReadyPayload
  [MessageType.MODULE_START]: ModuleStartPayload
  [MessageType.MODULE_EXIT]: ModuleExitPayload
  [MessageType.UI_UPDATE]: UIUpdatePayload
  [MessageType.ERROR]: ErrorPayload
  [MessageType.CONTEXT_UPDATE]: ModuleContextPayload
  [MessageType.DATA_REQUEST]: RequestPayload
  [MessageType.DATA_RESPONSE]: ResponsePayload
  [MessageType.HEARTBEAT]: HeartbeatPayload
}
