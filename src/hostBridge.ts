/**
 * @fileoverview Host-side bridge for communication with embedded modules.
 * @module @schoolpalm/message-bridge/hostBridge
 */

// src/hostBridge.ts
import { BridgeBase } from './bridgeBase';
import { MessageType } from './messageTypes';
import { ModuleStartPayload } from './payloadSchemas';

/**
 * Host-side bridge for communication with embedded modules.
 *
 * This class extends BridgeBase to provide host-specific functionality for
 * communicating with modules embedded in iframes. It handles initialization
 * and termination of modules.
 *
 * @example
 * ```typescript
 * const iframe = document.getElementById('module-iframe') as HTMLIFrameElement;
 * const hostBridge = new HostBridge(iframe, 'https://module.example.com');
 *
 * // Start a module
 * hostBridge.sendModuleStart({
 *   route: '/dashboard',
 *   context: { userId: 123 },
 *   timestamp: Date.now()
 * });
 *
 * // Listen for UI updates from the module
 * hostBridge.on(MessageType.UI_UPDATE, (payload) => {
 *   console.log('UI Update:', payload);
 * });
 * ```
 */
export class HostBridge extends BridgeBase {
  /**
   * Creates a new HostBridge instance.
   * @param iframe - The iframe element containing the module.
   * @param targetOrigin - The origin to restrict messages to (default: '*').
   */
  constructor(iframe: HTMLIFrameElement, targetOrigin: string = '*') {
    super(iframe.contentWindow!, targetOrigin);
  }

  /**
   * Sends a module-start message to the embedded module.
   * This initializes the module with the provided route and context.
   * @param payload - The module start payload containing route, context, and timestamp.
   */
  sendModuleStart(payload: ModuleStartPayload) {
    this.send(MessageType.MODULE_START, payload);
  }

  /**
   * Sends a module-exit message to the embedded module.
   * This signals the module to clean up and terminate.
   * @param reason - Optional reason for the module exit.
   */
  sendModuleExit(reason?: string) {
    this.send(MessageType.MODULE_EXIT, { reason });
  }
}
