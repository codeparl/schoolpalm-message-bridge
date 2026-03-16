/**
 * @fileoverview Message type definitions for Host ↔ Module communication.
 * @module @schoolpalm/message-bridge/messageTypes
 */

/**
 * Enumeration of all allowed message types for Host ↔ Module communication.
 *
 * These message types define the protocol for communication between the host
 * application and embedded modules. Each type indicates the direction and
 * purpose of the message.
 *
 * ⚡ Future-proof: additional custom messages can be sent via
 * `CUSTOM:<name>` without editing this enum.
 */
export enum MessageType {

   // -----------------------
  // Lifecycle
  // -----------------------
  /** Module → Host: Indicates the module is ready for communication. */
  HANDSHAKE_READY = 'handshake:ready',

  // -----------------------
  // UI & UX
  // -----------------------

  /** Module → Host: Indicates the module is ready for communication. */
  MODULE_READY = 'module:ready',
  /** Module → Host: Signals the module is unready/destroyed. */
  MODULE_UNREADY = 'module:unready',
  /** Host → Module: Signals the module to pause processing. */
  MODULE_PAUSE = 'module:pause',
  /** Host → Module: Signals the module to resume processing. */
  MODULE_RESUME = 'module:resume',
  /** Host → Module: Signals the module to start with provided context. */
  MODULE_START = 'module:start',
  /** Host → Module: Signals the module to exit and clean up. */
  MODULE_EXIT = 'module:exit',

  // -----------------------
  // Data & Context
  // -----------------------
  /** Module → Host: Requests data from the host. */
  DATA_REQUEST = 'data:request',
  /** Host → Module: Responds to a data request. */
  DATA_RESPONSE = 'data:response',
  /** Host → Module: Updates module context dynamically. */
  CONTEXT_UPDATE = 'context:update',
  /** Module → Host: Requests full host context. */
  CONTEXT_REQUEST = 'context:request',
  /** Module → Host: Subscribe to host data changes. */
  DATA_SUBSCRIBE = 'data:subscribe',
  /** Module → Host: Unsubscribe from host data changes. */
  DATA_UNSUBSCRIBE = 'data:unsubscribe',

  // -----------------------
  // UI / UX
  // -----------------------
  /** Module → Host: Updates the host UI (title, breadcrumb, theme). */
  UI_UPDATE = 'ui:update',
  /** Host → Module: Show loader overlay or spinner. */
  SHOW_LOADER = 'show:loader',
  /** Host → Module: Hide loader overlay or spinner. */
  HIDE_LOADER = 'hide:loader',
  /** Module → Host: Request a toast/notification. */
  NOTIFICATION = 'notification',
  /** Module → Host: Request a modal/dialog confirmation. */
  DIALOG = 'dialog',
  CONFIRM = 'dialog',
  /** Module → Host: Logs messages/warnings for centralized logging. */
  LOG = 'log',
  /** Module → Host: Reports an error to the host. */
  ERROR = 'error',

  // -----------------------
  // Navigation / Page Control
  // -----------------------
  /** Host → Module: Load a specific page/component. */
  LOAD_PAGE = 'load:page',
  /** Host → Module: Navigate module back in internal history. */
  NAVIGATE_BACK = 'navigate:back',
  /** Host → Module: Navigate module forward in internal history. */
  NAVIGATE_FORWARD = 'navigate:forward',
  /** Module → Host: Update breadcrumbs in host UI. */
  SET_BREADCRUMB = 'set:breadcrumb',

  // -----------------------
  // Permissions & Feature Flags
  // -----------------------
  /** Host → Module: Update allowed actions for module. */
  PERMISSION_UPDATE = 'permission:update',
  /** Host → Module: Enable/disable optional features. */
  FEATURE_TOGGLE = 'feature:toggle',

  // -----------------------
  // Assets / Resources
  // -----------------------
  /** Host → Module: Preload additional JS/CSS/images. */
  PRELOAD_RESOURCE = 'preload:resource',
  /** Module → Host: Notify that a lazy resource is loaded. */
  RESOURCE_LOADED = 'resource:loaded',

  // -----------------------
  // Lifecycle / Health
  // -----------------------
  /** Heartbeat for liveliness checks. Can be Module → Host or Host → Module. */
  HEARTBEAT = 'heartbeat',

  // -----------------------
  // Future-proof / Custom
  // -----------------------
  /** Use this prefix to send custom messages without modifying the core library. */
  CUSTOM_PREFIX = 'CUSTOM:',
}
