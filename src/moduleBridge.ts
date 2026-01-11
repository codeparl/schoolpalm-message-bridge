import { BridgeBase } from './bridgeBase'
import { MessageType } from './messageTypes'
import {
  HandshakeReadyPayload,
  UIUpdatePayload,
  ErrorPayload,
  RequestPayload,
  ResponsePayload,
  HeartbeatPayload
} from './payloadSchemas'

export class ModuleBridge extends BridgeBase {
  private startedPayload: any | null = null

  constructor(targetOrigin: string = '*') {
    super(window.parent, targetOrigin)
  }

  // --------------------
  // Handshake
  // --------------------
  sendHandshake(payload: HandshakeReadyPayload) {
    this.send(MessageType.HANDSHAKE_READY, payload)
  }

  // --------------------
  // Start (sticky)
  // --------------------
  onModuleStart(callback: (payload: any) => void) {
    if (this.startedPayload) {
      callback(this.startedPayload)
    }

    this.on(MessageType.MODULE_START, payload => {
      this.startedPayload = payload
      callback(payload)
    })
  }




onHeartbeat(callback?: (payload: HeartbeatPayload) => void) {
  this.on<HeartbeatPayload>(MessageType.HEARTBEAT, payload => {
    // Ignore ACK-only heartbeats
    if (payload?.ack) return

    callback?.(payload)

    const response: HeartbeatPayload = {
      timestamp: Date.now(),
      ack: true
    }

    this.send(MessageType.HEARTBEAT, response)
  })
}



  // --------------------
  // UI / Errors
  // --------------------
  sendUIUpdate(payload: UIUpdatePayload) {
    this.send(MessageType.UI_UPDATE, payload)
  }

  sendError(payload: ErrorPayload) {
    this.send(MessageType.ERROR, payload)
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
      payload: payload as any
    }
    return this.request<RequestPayload, R>(
      MessageType.DATA_REQUEST,
      request,
      timeout
    )
  }

  respondData(requestId: string, data: any, status: 'success' | 'error' = 'success') {
    const response: ResponsePayload = {
      requestId,
      status,
      payload: data
    }
    this.send(MessageType.DATA_RESPONSE, response)
  }
}
