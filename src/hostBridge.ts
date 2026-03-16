import { BridgeBase } from './bridgeBase'
import { MessageType } from './messageTypes'
import {
  ModuleStartPayload,
  ModuleExitPayload,
  UIUpdatePayload,
  ErrorPayload,
  ModuleContextPayload,
  HandshakeReadyPayload,
  RequestPayload,
  HeartbeatPayload,
  LoadPagePayload,
  BreadcrumbPayload,
  NotificationPayload,
  DialogPayload,
  PermissionPayload,
  FeatureTogglePayload,
  PreloadResourcePayload,
  ResourceLoadedPayload
} from './payloadSchemas'
import { PROTOCOL_VERSION } from './protocol'

export class HostBridge extends BridgeBase {
  private handshakeCompleted = false
  private handshakePayload: HandshakeReadyPayload | null = null
  private pendingStartPayload: ModuleStartPayload | null = null

  private heartbeatTimer?: number
  private lastHeartbeat = Date.now()

  constructor(iframe: HTMLIFrameElement, targetOrigin: string = '*') {
    if (!iframe.contentWindow) throw new Error('Iframe has no contentWindow')
    super(iframe.contentWindow, targetOrigin)
  }

  // --------------------
  // Handshake
  // --------------------
  onHandshakeReady(callback: (payload: HandshakeReadyPayload) => void) {
    if (this.handshakeCompleted && this.handshakePayload) {
      callback(this.handshakePayload)
      return
    }

    this.on(MessageType.HANDSHAKE_READY, payload => {
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

  // --------------------
  // Heartbeat
  // --------------------
  startHeartbeat(interval = 5000) {
    this.stopHeartbeat()
    this.heartbeatTimer = window.setInterval(() => {
      this.send(MessageType.HEARTBEAT, { timestamp: Date.now() } as HeartbeatPayload)
    }, interval)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = undefined
    }
  }

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
  // Module Start / Exit
  // --------------------
  startModule(payload: ModuleStartPayload, timeout = 5000) {
    if (this.handshakeCompleted) {
      this.sendModuleStart(payload)
      return
    }

    this.pendingStartPayload = payload

    const timer = setTimeout(() => console.error('Module handshake timeout'), timeout)
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

  sendContextUpdate(payload: ModuleContextPayload) {
    this.send(MessageType.CONTEXT_UPDATE, payload)
  }

  // --------------------
  // Requests
  // --------------------
  requestData<T = any, R = any>(type: string, payload?: T, timeout = 5000): Promise<R> {
    const request: RequestPayload = {
      requestId: crypto.randomUUID(),
      type,
      payload: payload as any,
    }
    return this.request<R>(MessageType.DATA_REQUEST, request, timeout)
  }

  // --------------------
  // Convenience methods for new features
  // --------------------
  loadPage(component: string, params?: Record<string, any>) {
    const payload: LoadPagePayload = { component, params }
    this.send(MessageType.LOAD_PAGE, payload)
  }

  navigateBack() {
    this.send(MessageType.NAVIGATE_BACK)
  }

  navigateForward() {
    this.send(MessageType.NAVIGATE_FORWARD)
  }

  setBreadcrumb(breadcrumb: string[]) {
    const payload: BreadcrumbPayload = { breadcrumb }
    this.send(MessageType.SET_BREADCRUMB, payload)
  }

  showLoader() {
    this.send(MessageType.SHOW_LOADER)
  }

  hideLoader() {
    this.send(MessageType.HIDE_LOADER)
  }

  notify(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const payload: NotificationPayload = { message, type }
    this.send(MessageType.NOTIFICATION, payload)
  }

  dialog(title: string, message: string) {
    const payload: DialogPayload = { title, message }
    this.send(MessageType.DIALOG, payload)
  }

  confirm(title: string, message: string) {
    const payload: DialogPayload = { title, message }
    this.send(MessageType.CONFIRM, payload)
  }

  pauseModule() {
    this.send(MessageType.MODULE_PAUSE)
  }

  resumeModule() {
    this.send(MessageType.MODULE_RESUME)
  }

  updatePermissions(permissions: string[]) {
    const payload: PermissionPayload = { permissions }
    this.send(MessageType.PERMISSION_UPDATE, payload)
  }

  toggleFeatures(features: Record<string, boolean>) {
    const payload: FeatureTogglePayload = { features }
    this.send(MessageType.FEATURE_TOGGLE, payload)
  }

  preloadResources(resources: string[]) {
    const payload: PreloadResourcePayload = { resources }
    this.send(MessageType.PRELOAD_RESOURCE, payload)
  }

  notifyResourceLoaded(resource: string) {
    const payload: ResourceLoadedPayload = { resource }
    this.send(MessageType.RESOURCE_LOADED, payload)
  }

  // --------------------
  // Reset
  // --------------------
  reset() {
    this.handshakeCompleted = false
    this.handshakePayload = null
    this.pendingStartPayload = null
  }
}
