import { BridgeBase } from './bridgeBase'
import { MessageType } from './messageTypes'
import {
  HandshakeReadyPayload,
  UIUpdatePayload,
  ErrorPayload,
  RequestPayload,
  ResponsePayload,
  HeartbeatPayload,
  MessagePayload
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

  // --------------------
  // Heartbeat
  // --------------------
  onHeartbeat(callback?: (payload: HeartbeatPayload) => void) {
    this.on(MessageType.HEARTBEAT, (payload: MessagePayload) => {
      const hb = payload as HeartbeatPayload

      // Ignore ACK-only heartbeats
      if (hb.ack) return

      callback?.(hb)

      this.send(MessageType.HEARTBEAT, {
        timestamp: Date.now(),
        ack: true
      } as HeartbeatPayload)
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
async requestData<T = any, R = any>(
  type: string,
  payload?: T,
  timeout = 5000
): Promise<R> {
  const request: RequestPayload = {
    requestId: crypto.randomUUID(),
    type,
    payload: payload as any
  }

  // Call base request (returns generic MessagePayload)
  const response = (await this.request<MessagePayload>(
    MessageType.DATA_REQUEST,
    request,
    timeout
  )) as ResponsePayload // Cast safely here

  if (response.status === 'error') {
    throw new Error(response.error || 'Unknown error from host')
  }

  return response.payload as R
}


  // --------------------
  // Respond to host requests
  // --------------------
  respondData(requestId: string, data: any, status: 'success' | 'error' = 'success') {
    const response: ResponsePayload = {
      requestId,
      status,
      payload: data
    }
    this.send(MessageType.DATA_RESPONSE, response)
  }
}
