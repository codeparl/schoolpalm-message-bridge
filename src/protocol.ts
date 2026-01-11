// src/protocol.ts

export enum ProtocolState {
  INIT = 'init',
  HANDSHAKEN = 'handshaken',
  STARTED = 'started',
  EXITED = 'exited'
}

export const PROTOCOL_VERSION = '1.0.0'
