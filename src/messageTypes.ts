/**
 * @fileoverview Message type definitions for bridge communication.
 * @module @schoolpalm/message-bridge/messageTypes
 */

// src/messageTypes.ts

/**
 * Enumeration of all allowed message types for Host ↔ Module communication.
 *
 * These message types define the protocol for communication between the host
 * application and embedded modules. Each type indicates the direction and
 * purpose of the message.
 *
 * @example
 * ```typescript
 * import { MessageType } from '@schoolpalm/message-bridge';
 *
 * // Listen for UI updates from modules
 * bridge.on(MessageType.UI_UPDATE, (payload) => {
 *   console.log('UI updated:', payload);
 * });
 * ```
 */
export enum MessageType {
  /** Module → Host: Indicates the module is ready for communication. */
  HANDSHAKE_READY = 'handshake:ready',
  /** Host → Module: Signals the module to start with provided context. */
  MODULE_START = 'module:start',
  /** Module → Host: Updates the host UI (title, breadcrumb, theme). */
  UI_UPDATE = 'ui:update',
  /** Module → Host: Requests data from the host. */
  DATA_REQUEST = 'data:request',
  /** Host → Module: Responds to a data request. */
  DATA_RESPONSE = 'data:response',
  /** Module → Host: Reports an error to the host. */
  ERROR = 'error',
  /** Host → Module: Signals the module to exit and clean up. */
  MODULE_EXIT = 'module:exit'
}
