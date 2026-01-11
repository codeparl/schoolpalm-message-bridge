import { MessageType } from './messageTypes'
import { MessagePayloadMap } from './payloadSchemas'
import { RequestPayload, ResponsePayload } from './payloadSchemas'

type MessageHandler<T> = (payload: T) => void

export class BridgeBase {
  protected targetWindow: Window
  protected targetOrigin: string

  private listeners = new Map<MessageType, MessageHandler<any>[]>()
  private pendingRequests = new Map<string, (payload: any) => void>()
  private boundHandler: (event: MessageEvent) => void

  constructor(targetWindow: Window, targetOrigin: string = '*') {
    this.targetWindow = targetWindow
    this.targetOrigin = targetOrigin

    this.boundHandler = this.handleMessage.bind(this)
    window.addEventListener('message', this.boundHandler)
  }

  // --------------------
  // Send (typed)
  // --------------------
  send<T extends MessageType>(
    type: T,
    payload: MessagePayloadMap[T]
  ) {
    this.targetWindow.postMessage({ type, payload }, this.targetOrigin)
  }

  // --------------------
  // Request / Response
  // --------------------
 request<R = any>(
  type: MessageType,
  payload: RequestPayload,
  timeout = 5000
): Promise<R> {
  return new Promise((resolve, reject) => {
    const requestId = payload.requestId

    this.pendingRequests.set(requestId, (response: ResponsePayload) => {
      if (response.status === 'error') {
        reject(new Error(response.error ?? 'Unknown error'))
      } else {
        resolve(response.payload as R)
      }
    })

    this.send(type, payload)

    setTimeout(() => {
      if (this.pendingRequests.has(requestId)) {
        this.pendingRequests.delete(requestId)
        reject(new Error(`Request ${payload.type} timed out`))
      }
    }, timeout)
  })
}


  // --------------------
  // Listeners (typed)
  // --------------------
  on<T extends MessageType>(
    type: T,
    callback: MessageHandler<MessagePayloadMap[T]>
  ) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)!.push(callback)
  }

  // --------------------
  // Dispatcher
  // --------------------
  protected handleMessage(event: MessageEvent) {
    if (this.targetOrigin !== '*' && event.origin !== this.targetOrigin) return

    const { type, payload } = event.data || {}
    if (!type) return

    // Handle responses
    if (type === MessageType.DATA_RESPONSE) {
      const response = payload as ResponsePayload
      const resolver = this.pendingRequests.get(response.requestId)
      if (resolver) {
        resolver(response)
        this.pendingRequests.delete(response.requestId)
        return
      }
    }

    const handlers = this.listeners.get(type)
    handlers?.forEach(cb => cb(payload))
  }

  destroy() {
    window.removeEventListener('message', this.boundHandler)
    this.listeners.clear()
    this.pendingRequests.clear()
  }
}
