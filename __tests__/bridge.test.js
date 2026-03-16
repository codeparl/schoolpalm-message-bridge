/**
 * @fileoverview Test suite for the MessageBridge SDK.
 * @module @schoolpalm/message-bridge/__tests__/bridge.test
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HostBridge, ModuleBridge, MessageType } from '../src/index';

/**
 * Test suite for the MessageBridge SDK.
 *
 * This suite tests the core functionality of both HostBridge and ModuleBridge
 * classes, including message sending, receiving, and event handling.
 */
describe('MessageBridge SDK', () => {
    let iframeMock;
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
        const callArg = window.parent.postMessage.mock.calls[0][0];
        expect(callArg.type).toBe(MessageType.HANDSHAKE_READY);
        expect(callArg.payload.version).toBe('0.1.0');
    });

    /**
     * Test that ModuleBridge sends UI update messages.
     */
    it('ModuleBridge sends UI update', () => {
        const moduleBridge = new ModuleBridge();
        moduleBridge.sendUIUpdate({ title: 'Users', breadcrumb: ['Home', 'Users'] });
        const callArg = window.parent.postMessage.mock.calls[0][0];
        expect(callArg.type).toBe(MessageType.UI_UPDATE);
        expect(callArg.payload.breadcrumb.length).toBe(2);
    });

    // -----------------------
    // NEW / Future-proof Tests
    // -----------------------
    it('ModuleBridge receives LOAD_PAGE messages', () => {
        const moduleBridge = new ModuleBridge();
        const callback = vi.fn();
        moduleBridge.on(MessageType.LOAD_PAGE, callback);

        const event = new MessageEvent('message', {
            data: { type: MessageType.LOAD_PAGE, payload: { component: 'AddStudent', params: { id: 1 } } }
        });
        window.dispatchEvent(event);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.calls[0][0].component).toBe('AddStudent');
        expect(callback.mock.calls[0][0].params.id).toBe(1);
    });

    it('ModuleBridge receives NAVIGATE_BACK / NAVIGATE_FORWARD', () => {
        const moduleBridge = new ModuleBridge();
        const backCallback = vi.fn();
        const forwardCallback = vi.fn();

        moduleBridge.on(MessageType.NAVIGATE_BACK, backCallback);
        moduleBridge.on(MessageType.NAVIGATE_FORWARD, forwardCallback);

        window.dispatchEvent(new MessageEvent('message', {
            data: { type: MessageType.NAVIGATE_BACK, payload: {} }
        }));
        window.dispatchEvent(new MessageEvent('message', {
            data: { type: MessageType.NAVIGATE_FORWARD, payload: {} }
        }));

        expect(backCallback).toHaveBeenCalledTimes(1);
        expect(forwardCallback).toHaveBeenCalledTimes(1);
    });

    it('ModuleBridge receives notifications', () => {
        const moduleBridge = new ModuleBridge();
        const callback = vi.fn();
        moduleBridge.on(MessageType.NOTIFICATION, callback);

        const event = new MessageEvent('message', {
            data: { type: MessageType.NOTIFICATION, payload: { message: 'Hello', type: 'info' } }
        });
        window.dispatchEvent(event);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.calls[0][0].message).toBe('Hello');
    });

    it('ModuleBridge handles feature toggles', () => {
        const moduleBridge = new ModuleBridge();
        const callback = vi.fn();
        moduleBridge.on(MessageType.FEATURE_TOGGLE, callback);

        const event = new MessageEvent('message', {
            data: { type: MessageType.FEATURE_TOGGLE, payload: { features: { darkMode: true } } }
        });
        window.dispatchEvent(event);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.calls[0][0].features.darkMode).toBe(true);
    });

    it('ModuleBridge receives PRELOAD_RESOURCE and notifies RESOURCE_LOADED', () => {
        const moduleBridge = new ModuleBridge();
        const preloadCallback = vi.fn();
        moduleBridge.on(MessageType.PRELOAD_RESOURCE, preloadCallback);

        const event = new MessageEvent('message', {
            data: { type: MessageType.PRELOAD_RESOURCE, payload: { resources: ['Students.js'] } }
        });
        window.dispatchEvent(event);

        expect(preloadCallback).toHaveBeenCalledTimes(1);
        expect(preloadCallback.mock.calls[0][0].resources[0]).toBe('Students.js');

        // Test RESOURCE_LOADED
        moduleBridge.send(MessageType.RESOURCE_LOADED, { resource: 'Students.js' });
        const callArg = window.parent.postMessage.mock.calls[0][0];
        expect(callArg.type).toBe(MessageType.RESOURCE_LOADED);
        expect(callArg.payload.resource).toBe('Students.js');
    });

  it('ModuleBridge handles DIALOG / CONFIRM messages', () => {
    const moduleBridge = new ModuleBridge();
    const dialogCallback = vi.fn();

    moduleBridge.on(MessageType.DIALOG, dialogCallback);
    moduleBridge.on(MessageType.CONFIRM, dialogCallback);

    // Simulate DIALOG message from parent
    window.dispatchEvent(new MessageEvent('message', {
        data: { type: MessageType.DIALOG, payload: { message: 'Are you sure?' } },
        origin: '*'  // match targetOrigin
    }));

    // Simulate CONFIRM message from parent
    window.dispatchEvent(new MessageEvent('message', {
        data: { type: MessageType.CONFIRM, payload: { message: 'Confirm?' } },
        origin: '*'
    }));

    expect(dialogCallback).toHaveBeenCalledTimes(2);
    expect(dialogCallback.mock.calls[0][0].message).toBe('Are you sure?');
    expect(dialogCallback.mock.calls[1][0].message).toBe('Confirm?');
});


    it('ModuleBridge handles SHOW_LOADER / HIDE_LOADER', () => {
        const moduleBridge = new ModuleBridge();
        const showCallback = vi.fn();
        const hideCallback = vi.fn();

        moduleBridge.on(MessageType.SHOW_LOADER, showCallback);
        moduleBridge.on(MessageType.HIDE_LOADER, hideCallback);

        window.dispatchEvent(new MessageEvent('message', { data: { type: MessageType.SHOW_LOADER } }));
        window.dispatchEvent(new MessageEvent('message', { data: { type: MessageType.HIDE_LOADER } }));

        expect(showCallback).toHaveBeenCalledTimes(1);
        expect(hideCallback).toHaveBeenCalledTimes(1);
    });
});
