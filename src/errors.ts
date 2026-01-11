export class BridgeError extends Error {
  constructor(message: string, public code: string) {
    super(message)
  }
}
