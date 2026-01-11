import { BridgeBase } from './bridgeBase'
import { MessageType } from './messageTypes'
import {
  ModuleStartPayload,
  ModuleExitPayload,
  UIUpdatePayload,
  ErrorPayload,
  ModuleContextPayload,
  HandshakeReadyPayload,
  RequestPayload
} from './payloadSchemas'
import { PROTOCOL_VERSION } from './protocol'

export class HostBridge extends BridgeBase {
  private handshakeCompleted = false
  private handshakePayload: HandshakeReadyPayload | null = null
  private pendingStartPayload: ModuleStartPayload | null = null

  constructor(iframe: HTMLIFrameElement, targetOrigin: string = '*') {
    if (!iframe.contentWindow) {
      throw new Error('Iframe has no contentWindow')
    }
    super(iframe.contentWindow, targetOrigin)
  }

  // --------------------
  // Handshake (sticky)
  // --------------------
onHandshakeReady(callback: (payload: HandshakeReadyPayload) => void) {
  if (this.handshakeCompleted && this.handshakePayload) {
    callback(this.handshakePayload)
    return
  }

  this.on(MessageType.HANDSHAKE_READY, payload => {
    // ✅ payload is HandshakeReadyPayload
    if (payload.version !== PROTOCOL_VERSION) {
      console.warn(
        `Protocol mismatch: host=${PROTOCOL_VERSION}, module=${payload.version}`
      )
    }

    this.handshakeCompleted = true
    this.handshakePayload = payload
    callback(payload)

    if (this.pendingStartPayload) {
      this.sendModuleStart(this.pendingStartPayload)
      this.pendingStartPayload = null
    }
  })
}


// hostBridge.ts
private heartbeatTimer?: number

startHeartbeat(interval = 5000) {
  this.stopHeartbeat()

  this.heartbeatTimer = window.setInterval(() => {
    this.send(MessageType.HEARTBEAT, { ts: Date.now() })
  }, interval)
}

stopHeartbeat() {
  if (this.heartbeatTimer) {
    clearInterval(this.heartbeatTimer)
    this.heartbeatTimer = undefined
  }
}

private lastHeartbeat = Date.now()

listenHeartbeat(timeout = 15000) {
  this.on(MessageType.HEARTBEAT, () => {
    this.lastHeartbeat = Date.now()
  })

  setInterval(() => {
    if (Date.now() - this.lastHeartbeat > timeout) {
      console.error('Module heartbeat lost')
      this.sendModuleExit('heartbeat-timeout')
    }
  }, timeout)
}


  // --------------------
  // Start (idempotent)
  // --------------------
  startModule(payload: ModuleStartPayload, timeout = 5000) {
    if (this.handshakeCompleted) {
      this.sendModuleStart(payload)
      return
    }

    this.pendingStartPayload = payload

    const timer = setTimeout(() => {
      console.error('Module handshake timeout')
    }, timeout)

    this.onHandshakeReady(() => clearTimeout(timer))
  }

  sendModuleStart(payload: ModuleStartPayload) {
    this.send(MessageType.MODULE_START, payload)
  }

  sendModuleExit(reason?: string) {
    this.send(MessageType.MODULE_EXIT, { reason } as ModuleExitPayload)
  }

  // --------------------
  // UI / Errors
  // --------------------
  onUIUpdate(callback: (payload: UIUpdatePayload) => void) {
    this.on(MessageType.UI_UPDATE, callback)
  }

  onError(callback: (payload: ErrorPayload) => void) {
    this.on(MessageType.ERROR, callback)
  }

  // --------------------
  // Context sync
  // --------------------
  sendContextUpdate(payload: ModuleContextPayload) {
    this.send(MessageType.CONTEXT_UPDATE, payload)
  }

  // --------------------
  // Requests
  // --------------------
 requestData<T = any, R = any>(
  type: string,
  payload?: T,
  timeout = 5000
): Promise<R> {
  const request: RequestPayload = {
    requestId: crypto.randomUUID(),
    type,
    payload: payload as any,
  }

  return this.request<R>(
    MessageType.DATA_REQUEST,
    request,
    timeout
  )
}

  // --------------------
  // Reset (reconnect)
  // --------------------
  reset() {
    this.handshakeCompleted = false
    this.handshakePayload = null
    this.pendingStartPayload = null
  }
}
