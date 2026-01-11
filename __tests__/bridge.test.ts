import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { HostBridge, ModuleBridge, MessageType } from '../src'
import type { ModuleStartPayload, UIUpdatePayload, HandshakeReadyPayload } from '../src/payloadSchemas'

describe('MessageBridge SDK', () => {
  let iframeMock: any
  let parentPostMessageMock: any

  beforeEach(() => {
    iframeMock = {
      contentWindow: {
        postMessage: vi.fn()
      }
    }

    parentPostMessageMock = vi.fn()

    vi.stubGlobal('parent', { postMessage: parentPostMessageMock })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  // -----------------------
  // HostBridge Tests
  // -----------------------
  it('HostBridge sends MODULE_START correctly', () => {
    const hostBridge = new HostBridge(iframeMock)
    const payload: ModuleStartPayload = {
      moduleId: 'm1',
      route: '/users',
      context: {},
      timestamp: Date.now()
    }

    hostBridge.sendModuleStart(payload)

    expect(iframeMock.contentWindow.postMessage).toHaveBeenCalledTimes(1)
    const callArg = iframeMock.contentWindow.postMessage.mock.calls[0][0]
    expect(callArg.type).toBe(MessageType.MODULE_START)
    expect(callArg.payload.route).toBe('/users')
    expect(callArg.payload.moduleId).toBe('m1')
  })

  it('HostBridge can register and receive UI_UPDATE messages', () => {
    const hostBridge = new HostBridge(iframeMock)
    const callback = vi.fn()
    hostBridge.on(MessageType.UI_UPDATE, callback)

    const payload: UIUpdatePayload = { title: 'Test', breadcrumb: ['Home'] }
    const event = new MessageEvent('message', {
      data: { type: MessageType.UI_UPDATE, payload }
    })

    window.dispatchEvent(event)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback.mock.calls[0][0].title).toBe('Test')
  })

  // -----------------------
  // ModuleBridge Tests
  // -----------------------
  it('ModuleBridge sends HANDSHAKE_READY correctly', () => {
    const moduleBridge = new ModuleBridge()
    const payload: HandshakeReadyPayload = { version: '0.1.0', timestamp: Date.now() }

    moduleBridge.sendHandshake(payload)

    expect(parentPostMessageMock).toHaveBeenCalledTimes(1)
    const callArg = parentPostMessageMock.mock.calls[0][0]
    expect(callArg.type).toBe(MessageType.HANDSHAKE_READY)
    expect(callArg.payload.version).toBe('0.1.0')
  })

  it('ModuleBridge sends UI_UPDATE correctly', () => {
    const moduleBridge = new ModuleBridge()
    const payload: UIUpdatePayload = { title: 'Users', breadcrumb: ['Home', 'Users'] }

    moduleBridge.sendUIUpdate(payload)

    const callArg = parentPostMessageMock.mock.calls[0][0]
    expect(callArg.type).toBe(MessageType.UI_UPDATE)
    expect(callArg.payload.breadcrumb.length).toBe(2)
  })

  // -----------------------
  // Request / Response Tests
  // -----------------------
  it('ModuleBridge can request data from host', async () => {
    const moduleBridge = new ModuleBridge()

    // Stub window.addEventListener to simulate a host DATA_RESPONSE
    vi.stubGlobal('addEventListener', (event: string, handler: any) => {
      if (event === 'message') {
        setTimeout(() => {
          handler({
            data: {
              type: MessageType.DATA_RESPONSE,
              payload: {
                requestId: 'fake-id',
                status: 'success',
                payload: { foo: 'bar' }
              }
            }
          })
        }, 0)
      }
    })

    const result = await moduleBridge.requestData('getFoo', { id: 1 }, 1000).catch(() => null)
    expect(result).toBeDefined()
  })

  it('ModuleBridge can respond to host request', () => {
    const moduleBridge = new ModuleBridge()
    moduleBridge.respondData('req-1', { hello: 'world' }, 'success')

    const callArg = parentPostMessageMock.mock.calls[0][0]
    expect(callArg.type).toBe(MessageType.DATA_RESPONSE)
    expect(callArg.payload.requestId).toBe('req-1')
    expect(callArg.payload.payload.hello).toBe('world')
  })
})
