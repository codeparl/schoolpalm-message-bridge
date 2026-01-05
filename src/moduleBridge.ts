/**
 * @fileoverview Module-side bridge for communication with the host application.
 * @module @schoolpalm/message-bridge/moduleBridge
 */

// src/moduleBridge.ts
import { BridgeBase } from './bridgeBase';
import { MessageType } from './messageTypes';
import {
  HandshakeReadyPayload,
  UIUpdatePayload,
  ErrorPayload
} from './payloadSchemas';

/**
 * Module-side bridge for communication with the host application.
 *
 * This class extends BridgeBase to provide module-specific functionality for
 * communicating with the parent host application. It handles handshake,
 * UI updates, and error reporting from the embedded module.
 *
 * @example
 * ```typescript
 * const moduleBridge = new ModuleBridge('https://host.example.com');
 *
 * // Send handshake when module is ready
 * moduleBridge.sendHandshake({
 *   version: '1.0.0',
 *   timestamp: Date.now()
 * });
 *
 * // Update UI in the host
 * moduleBridge.sendUIUpdate({
 *   title: 'Dashboard',
 *   breadcrumb: ['Home', 'Dashboard'],
 *   theme: 'dark'
 * });
 *
 * // Listen for module start from host
 * moduleBridge.on(MessageType.MODULE_START, (payload) => {
 *   console.log('Module started:', payload.route);
 * });
 * ```
 */
export class ModuleBridge extends BridgeBase {
  /**
   * Creates a new ModuleBridge instance.
   * @param targetOrigin - The origin to restrict messages to (default: '*').
   */
  constructor(targetOrigin: string = '*') {
    super(window.parent, targetOrigin);
  }

  /**
   * Notifies the host application that the module is ready.
   * This should be called after the module has initialized.
   * @param payload - The handshake payload containing version and timestamp.
   */
  sendHandshake(payload: HandshakeReadyPayload) {
    this.send(MessageType.HANDSHAKE_READY, payload);
  }

  /**
   * Notifies the host application of UI updates.
   * This includes changes to title, breadcrumb, and theme.
   * @param payload - The UI update payload.
   */
  sendUIUpdate(payload: UIUpdatePayload) {
    this.send(MessageType.UI_UPDATE, payload);
  }

  /**
   * Notifies the host application of an error.
   * @param payload - The error payload containing error details.
   */
  sendError(payload: ErrorPayload) {
    this.send(MessageType.ERROR, payload);
  }
}
