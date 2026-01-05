/**
 * @fileoverview Test suite for the MessageBridge SDK.
 * @module @schoolpalm/message-bridge/__tests__/bridge.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HostBridge, ModuleBridge, MessageType } from '../index';

/**
 * Test suite for the MessageBridge SDK.
 *
 * This suite tests the core functionality of both HostBridge and ModuleBridge
 * classes, including message sending, receiving, and event handling.
 */
describe('MessageBridge SDK', () => {
  let iframeMock: any;

  beforeEach(() => {
    // Simulate an iframe with contentWindow
    iframeMock = {
      contentWindow: {
        postMessage: vi.fn()
      }
    };

    // Mock parent window for ModuleBridge
    vi.stubGlobal('parent', {
      postMessage: vi.fn()
    });
  });

  // -----------------------
  // HostBridge Tests
  // -----------------------

  /**
   * Test that HostBridge sends module-start messages correctly.
   */
  it('HostBridge sends module-start correctly', () => {
    const hostBridge = new HostBridge(iframeMock);
    hostBridge.sendModuleStart({ route: '/users', context: {}, timestamp: Date.now() });

    expect(iframeMock.contentWindow.postMessage).toHaveBeenCalledTimes(1);
    const callArg = iframeMock.contentWindow.postMessage.mock.calls[0][0];
    expect(callArg.type).toBe(MessageType.MODULE_START);
    expect(callArg.payload.route).toBe('/users');
  });

  /**
   * Test that HostBridge can register listeners and receive messages.
   */
  it('HostBridge can register and receive messages', () => {
    const hostBridge = new HostBridge(iframeMock);

    const callback = vi.fn();
    hostBridge.on(MessageType.UI_UPDATE, callback);

    // Simulate incoming postMessage from iframe
    const event = new MessageEvent('message', {
      data: {
        type: MessageType.UI_UPDATE,
        payload: { title: 'Test', breadcrumb: ['Home'] }
      }
    });

    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0].title).toBe('Test');
  });

  // -----------------------
  // ModuleBridge Tests
  // -----------------------

  /**
   * Test that ModuleBridge sends handshake messages correctly.
   */
  it('ModuleBridge sends handshake correctly', () => {
    const moduleBridge = new ModuleBridge();
    moduleBridge.sendHandshake({ version: '0.1.0', timestamp: Date.now() });

    expect(window.parent.postMessage).toHaveBeenCalledTimes(1);
    const callArg = (window.parent.postMessage as any).mock.calls[0][0];
    expect(callArg.type).toBe(MessageType.HANDSHAKE_READY);
    expect(callArg.payload.version).toBe('0.1.0');
  });

  /**
   * Test that ModuleBridge sends UI update messages.
   */
  it('ModuleBridge sends UI update', () => {
    const moduleBridge = new ModuleBridge();
    moduleBridge.sendUIUpdate({ title: 'Users', breadcrumb: ['Home', 'Users'] });

    const callArg = (window.parent.postMessage as any).mock.calls[0][0];
    expect(callArg.type).toBe(MessageType.UI_UPDATE);
    expect(callArg.payload.breadcrumb.length).toBe(2);
  });
});
