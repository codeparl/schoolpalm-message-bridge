/**
 * @fileoverview Payload schema definitions for message-based communication.
 * @module @schoolpalm/message-bridge/payloadSchemas
 */

// src/payloadSchemas.ts
import { MessageType } from './messageTypes';

/**
 * Payload interfaces for each message type in the bridge communication protocol.
 *
 * These interfaces define the structure of data exchanged between host applications
 * and embedded modules. Each payload corresponds to a specific message type and
 * contains the necessary information for that communication scenario.
 */

/**
 * Payload for handshake ready message.
 * Sent by modules to indicate they are ready for communication.
 */
export interface HandshakeReadyPayload {
  /** Version of the module or SDK */
  version: string;
  /** Timestamp when the handshake was initiated */
  timestamp: number;
}

/**
 * Payload for module start message.
 * Sent by host to initialize a module with context.
 */
export interface ModuleStartPayload {
  /** Route or path to navigate to in the module */
  route: string;
  /** Context data passed to the module (user info, permissions, etc.) */
  context: Record<string, any>;
  /** Timestamp when the module start was requested */
  timestamp: number;
}

/**
 * Payload for UI update message.
 * Sent by modules to update the host application's UI.
 */
export interface UIUpdatePayload {
  /** Title to display in the host UI */
  title: string;
  /** Breadcrumb navigation path */
  breadcrumb: string[];
  /** Optional theme to apply to the host UI */
  theme?: string;
}

/**
 * Payload for data request message.
 * Sent by modules to request data from the host.
 */
export interface DataRequestPayload {
  /** Unique identifier for tracking the request */
  requestId: string;
  /** Action or endpoint to request data from */
  action: string;
  /** Optional payload data for the request */
  payload?: Record<string, any>;
}

/**
 * Payload for data response message.
 * Sent by host in response to data requests.
 */
export interface DataResponsePayload {
  /** Unique identifier matching the original request */
  requestId: string;
  /** Status of the response */
  status: 'success' | 'error';
  /** Response data (present on success) */
  payload?: any;
}

/**
 * Payload for error message.
 * Sent by modules to report errors to the host.
 */
export interface ErrorPayload {
  /** Error code for categorization */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Optional additional error details */
  details?: any;
}

/**
 * Payload for module exit message.
 * Sent by host to signal module termination.
 */
export interface ModuleExitPayload {
  /** Optional reason for the module exit */
  reason?: string;
}

/**
 * Union type representing all possible message payloads.
 *
 * This type is used internally for type safety when handling messages
 * of any type in the bridge classes.
 */
export type MessagePayload =
  | HandshakeReadyPayload
  | ModuleStartPayload
  | UIUpdatePayload
  | DataRequestPayload
  | DataResponsePayload
  | ErrorPayload
  | ModuleExitPayload;
