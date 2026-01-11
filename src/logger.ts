export const debug = (...args: any[]) => {
  if (import.meta.env?.DEV) {
    console.debug('[MessageBridge]', ...args)
  }
}
