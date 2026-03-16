import { BridgeBase } from './bridgeBase'
import { MessageType } from './messageTypes'
import {
  HandshakeReadyPayload,
  UIUpdatePayload,
  ErrorPayload,
  RequestPayload,
  ResponsePayload,
  HeartbeatPayload,
  LoadPagePayload,
  BreadcrumbPayload,
  NotificationPayload,
  DialogPayload,
  PermissionPayload,
  FeatureTogglePayload,
  PreloadResourcePayload,
  ResourceLoadedPayload,
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
  // Module Start
  // --------------------
  onModuleStart(callback: (payload: any) => void) {
    if (this.startedPayload) callback(this.startedPayload)

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
      if (hb.ack) return
      callback?.(hb)
      this.send(MessageType.HEARTBEAT, { timestamp: Date.now(), ack: true } as HeartbeatPayload)
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
  async requestData<T = any, R = any>(type: string, payload?: T, timeout = 5000): Promise<R> {
    const request: RequestPayload = {
      requestId: crypto.randomUUID(),
      type,
      payload: payload as any
    }

    const response = (await this.request<MessagePayload>(
      MessageType.DATA_REQUEST,
      request,
      timeout
    )) as ResponsePayload

    if (response.status === 'error') throw new Error(response.error || 'Unknown error from host')
    return response.payload as R
  }

  respondData(requestId: string, data: any, status: 'success' | 'error' = 'success') {
    const response: ResponsePayload = { requestId, status, payload: data }
    this.send(MessageType.DATA_RESPONSE, response)
  }

  // --------------------
  // Convenience methods to handle host messages
  // --------------------
  onLoadPage(callback: (payload: LoadPagePayload) => void) {
    this.on(MessageType.LOAD_PAGE, callback)
  }

  onNavigateBack(callback: () => void) {
    this.on(MessageType.NAVIGATE_BACK, callback)
  }

  onNavigateForward(callback: () => void) {
    this.on(MessageType.NAVIGATE_FORWARD, callback)
  }

  onSetBreadcrumb(callback: (payload: BreadcrumbPayload) => void) {
    this.on(MessageType.SET_BREADCRUMB, callback)
  }

  onShowLoader(callback: () => void) {
    this.on(MessageType.SHOW_LOADER, callback)
  }

  onHideLoader(callback: () => void) {
    this.on(MessageType.HIDE_LOADER, callback)
  }

  onNotification(callback: (payload: NotificationPayload) => void) {
    this.on(MessageType.NOTIFICATION, callback)
  }

  onDialog(callback: (payload: DialogPayload) => void) {
    this.on(MessageType.DIALOG, callback)
  }

  onConfirm(callback: (payload: DialogPayload) => void) {
    this.on(MessageType.CONFIRM, callback)
  }

  onPause(callback: () => void) {
    this.on(MessageType.MODULE_PAUSE, callback)
  }

  onResume(callback: () => void) {
    this.on(MessageType.MODULE_RESUME, callback)
  }

  onPermissionUpdate(callback: (payload: PermissionPayload) => void) {
    this.on(MessageType.PERMISSION_UPDATE, callback)
  }

  onFeatureToggle(callback: (payload: FeatureTogglePayload) => void) {
    this.on(MessageType.FEATURE_TOGGLE, callback)
  }

  onPreloadResources(callback: (payload: PreloadResourcePayload) => void) {
    this.on(MessageType.PRELOAD_RESOURCE, callback)
  }

  onResourceLoaded(callback: (payload: ResourceLoadedPayload) => void) {
    this.on(MessageType.RESOURCE_LOADED, callback)
  }

  // --------------------
  // Notify host about resource ready
  // --------------------
  notifyResourceLoaded(resource: string) {
    this.send(MessageType.RESOURCE_LOADED, { resource } as ResourceLoadedPayload)
  }
}
