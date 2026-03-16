// src/payloadSchemas.ts
import { MessageType } from './messageTypes'

// -----------------------
// Existing / core payloads
// -----------------------
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
  theme?: string,
  darkMode?:boolean
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

export interface HeartbeatPayload {
  timestamp: number
  ack?: boolean
}

// -----------------------
// NEW / Future payloads
// -----------------------
export interface LoadPagePayload {
  component: string
  params?: Record<string, any>
}

export interface NavigationPayload {} // NAVIGATE_BACK / NAVIGATE_FORWARD

export interface BreadcrumbPayload {
  breadcrumb: string[]
}

export interface NotificationPayload {
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

export interface DialogPayload {
  title?: string
  message: string
}

export interface PauseResumePayload {} 

export interface PermissionPayload {
  permissions: string[]
}

export interface FeatureTogglePayload {
  features: Record<string, boolean>
}

export interface PreloadResourcePayload {
  resources: string[]
}

export interface ResourceLoadedPayload {
  resource: string
}

export type LogPayload = { message: string; level?: 'info' | 'warn' | 'error' }

// -----------------------
// Full MessagePayload union
// -----------------------
export type MessagePayload =
  // Core / Lifecycle
  | HandshakeReadyPayload
  | ModuleStartPayload
  | ModuleExitPayload
  | UIUpdatePayload
  | ErrorPayload
  | ModuleContextPayload
  | RequestPayload
  | ResponsePayload
  | HeartbeatPayload
  // Navigation / Page Control
  | LoadPagePayload
  | NavigationPayload
  // UI hints / UX coordination
  | BreadcrumbPayload
  | NotificationPayload
  | DialogPayload
  | PauseResumePayload
  | PermissionPayload
  | FeatureTogglePayload
  | PreloadResourcePayload
  | ResourceLoadedPayload
  | LogPayload
  | undefined // for SHOW_LOADER / HIDE_LOADER
  // Custom messages
  | any // CUSTOM:* messages

// -----------------------
// Map MessageType → Payload
// -----------------------
export interface MessagePayloadMap {
  // Core / Lifecycle
  [MessageType.HANDSHAKE_READY]: HandshakeReadyPayload
  [MessageType.MODULE_START]: ModuleStartPayload
  [MessageType.MODULE_EXIT]: ModuleExitPayload
  [MessageType.UI_UPDATE]: UIUpdatePayload
  [MessageType.ERROR]: ErrorPayload
  [MessageType.CONTEXT_UPDATE]: ModuleContextPayload
  [MessageType.DATA_REQUEST]: RequestPayload
  [MessageType.DATA_RESPONSE]: ResponsePayload
  [MessageType.HEARTBEAT]: HeartbeatPayload

  // Navigation / Page Control
  [MessageType.LOAD_PAGE]: LoadPagePayload
  [MessageType.NAVIGATE_BACK]: NavigationPayload
  [MessageType.NAVIGATE_FORWARD]: NavigationPayload

  // UI hints / UX coordination
  [MessageType.SET_BREADCRUMB]: BreadcrumbPayload
  [MessageType.SHOW_LOADER]: undefined
  [MessageType.HIDE_LOADER]: undefined
  [MessageType.NOTIFICATION]: NotificationPayload
  [MessageType.DIALOG]: DialogPayload
  [MessageType.CONFIRM]: DialogPayload

  // Lifecycle / performance
  [MessageType.MODULE_PAUSE]: PauseResumePayload
  [MessageType.MODULE_RESUME]: PauseResumePayload

  // Permissions / Features
  [MessageType.PERMISSION_UPDATE]: PermissionPayload
  [MessageType.FEATURE_TOGGLE]: FeatureTogglePayload

  // Assets / resources
  [MessageType.PRELOAD_RESOURCE]: PreloadResourcePayload
  [MessageType.RESOURCE_LOADED]: ResourceLoadedPayload

  // Logging
  [MessageType.LOG]: LogPayload

  // ⚡ Future / Custom messages
  [key: `CUSTOM:${string}`]: any
}
