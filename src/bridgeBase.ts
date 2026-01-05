/**
 * @fileoverview Base bridge class for message-based communication.
 * @module @schoolpalm/message-bridge/bridgeBase
 */

// src/bridgeBase.ts
import { MessageType } from './messageTypes';
import { MessagePayload } from './payloadSchemas';

/**
 * Type definition for message handler functions.
 * @template T - The type of message payload this handler accepts.
 */
type MessageHandler<T extends MessagePayload> = (payload: T) => void;

/**
 * Base class for Host and Module bridges.
 *
 * This abstract base class provides the core functionality for message-based
 * communication between windows using the postMessage API. It handles sending
 * messages, registering listeners, and managing event listeners.
 *
 * @example
 * ```typescript
 * class CustomBridge extends BridgeBase {
 *   constructor(targetWindow: Window) {
 *     super(targetWindow, 'https://example.com');
 *   }
 *
 *   // Add custom methods here
 * }
 * ```
 */
export class BridgeBase {
  /** The target window to send messages to. */
  protected targetWindow: Window;
  /** The origin to restrict messages to. */
  protected targetOrigin: string;
  /** Map of message type to array of handler functions. */
  private listeners: Map<MessageType, MessageHandler<any>[]> = new Map();

  /**
   * Creates a new BridgeBase instance.
   * @param targetWindow - The window to send messages to.
   * @param targetOrigin - The origin to restrict messages to (default: '*').
   */
  constructor(targetWindow: Window, targetOrigin: string = '*') {
    this.targetWindow = targetWindow;
    this.targetOrigin = targetOrigin;
    window.addEventListener('message', this._handleMessage.bind(this));
  }

  /**
   * Sends a message to the target window.
   * @template T - The type of the message payload.
   * @param type - The message type to send.
   * @param payload - The payload data to send.
   */
  send<T extends MessagePayload>(type: MessageType, payload: T) {
    this.targetWindow.postMessage({ type, payload }, this.targetOrigin);
  }

  /**
   * Registers a listener for a specific message type.
   * @template T - The type of the message payload.
   * @param type - The message type to listen for.
   * @param callback - The function to call when a message of this type is received.
   */
  on<T extends MessagePayload>(type: MessageType, callback: MessageHandler<T>) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type)?.push(callback);
  }

  /**
   * Internal message handler for incoming postMessage events.
   * @private
   * @param event - The message event received.
   */
  private _handleMessage(event: MessageEvent) {
    const { type, payload } = event.data || {};
    if (!type || !this.listeners.has(type)) return;
    this.listeners.get(type)?.forEach(cb => cb(payload));
  }

  /**
   * Cleans up event listeners and resources.
   * Call this method when the bridge is no longer needed.
   */
  destroy() {
    window.removeEventListener('message', this._handleMessage.bind(this));
    this.listeners.clear();
  }
}
