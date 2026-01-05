/**
 * @packageDocumentation
 * @module @schoolpalm/message-bridge
 *
 * TypeScript SDK for message-based communication between SchoolPalm host and vendor modules.
 *
 * This module exports the main classes and types for establishing communication
 * between a host application and embedded modules using the postMessage API.
 *
 * @example
 * ```typescript
 * import { HostBridge, ModuleBridge, MessageType } from '@schoolpalm/message-bridge';
 * ```
 */

export { BridgeBase } from './bridgeBase';
export { HostBridge } from './hostBridge';
export { ModuleBridge } from './moduleBridge';
export { MessageType } from './messageTypes';
export * from './payloadSchemas';
