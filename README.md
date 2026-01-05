
# @schoolpalm/message-bridge

[![npm version](https://badge.fury.io/js/%40schoolpalm%2Fmessage-bridge.svg)](https://badge.fury.io/js/%40schoolpalm%2Fmessage-bridge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TypeScript SDK for message-based communication between SchoolPalm host and vendor modules.

## Overview

The `@schoolpalm/message-bridge` SDK provides a robust, type-safe way to establish bidirectional communication between a host web application and embedded modules (typically iframes) using the browser's `postMessage` API. This enables seamless integration of third-party modules into the SchoolPalm platform while maintaining security through origin restrictions.

## Features

- **Type-safe messaging**: Full TypeScript support with strongly typed message payloads
- **Bidirectional communication**: Send messages from host to module and vice versa
- **Security-focused**: Origin restrictions and structured message protocols
- **Event-driven architecture**: Register listeners for specific message types
- **Lightweight**: Minimal dependencies, focused on core functionality
- **Well-tested**: Comprehensive test suite with Vitest

## Installation

```bash
npm install @schoolpalm/message-bridge
```

## Quick Start

### Host Application

```typescript
import { HostBridge, MessageType } from '@schoolpalm/message-bridge';

// Create a bridge for an embedded iframe
const iframe = document.getElementById('module-iframe') as HTMLIFrameElement;
const hostBridge = new HostBridge(iframe, 'https://module.example.com');

// Start a module with context
hostBridge.sendModuleStart({
  route: '/dashboard',
  context: { userId: 123, permissions: ['read', 'write'] },
  timestamp: Date.now()
});

// Listen for UI updates from the module
hostBridge.on(MessageType.UI_UPDATE, (payload) => {
  document.title = payload.title;
  updateBreadcrumb(payload.breadcrumb);
});

// Listen for data requests
hostBridge.on(MessageType.DATA_REQUEST, (payload) => {
  // Handle data request and send response
  const response = fetchData(payload.action, payload.payload);
  hostBridge.send(MessageType.DATA_RESPONSE, {
    requestId: payload.requestId,
    status: 'success',
    payload: response
  });
});
```

### Embedded Module

```typescript
import { ModuleBridge, MessageType } from '@schoolpalm/message-bridge';

// Create a bridge for the module
const moduleBridge = new ModuleBridge('https://host.example.com');

// Send handshake when ready
moduleBridge.sendHandshake({
  version: '1.0.0',
  timestamp: Date.now()
});

// Listen for module start
moduleBridge.on(MessageType.MODULE_START, (payload) => {
  navigateToRoute(payload.route);
  initializeWithContext(payload.context);
});

// Update host UI
moduleBridge.sendUIUpdate({
  title: 'User Management',
  breadcrumb: ['Home', 'Users', 'Management'],
  theme: 'dark'
});

// Request data from host
moduleBridge.send(MessageType.DATA_REQUEST, {
  requestId: 'user-list-123',
  action: 'getUsers',
  payload: { page: 1, limit: 20 }
});
```

## API Reference

### Classes

- **`BridgeBase`**: Abstract base class providing core messaging functionality
- **`HostBridge`**: Host-side bridge for communicating with embedded modules
- **`ModuleBridge`**: Module-side bridge for communicating with the host application

### Message Types

The SDK defines a comprehensive set of message types for different communication scenarios:

- `HANDSHAKE_READY`: Module signals readiness to the host
- `MODULE_START`: Host initializes a module with context
- `UI_UPDATE`: Module updates host UI (title, breadcrumb, theme)
- `DATA_REQUEST`: Module requests data from host
- `DATA_RESPONSE`: Host responds to data requests
- `ERROR`: Module reports errors to host
- `MODULE_EXIT`: Host signals module to clean up and exit

### Payload Schemas

All message payloads are strongly typed TypeScript interfaces:

- `HandshakeReadyPayload`
- `ModuleStartPayload`
- `UIUpdatePayload`
- `DataRequestPayload`
- `DataResponsePayload`
- `ErrorPayload`
- `ModuleExitPayload`

## Project Structure

```
src/
├── index.ts          # Main entry point and exports
├── bridgeBase.ts     # Base bridge class with core functionality
├── hostBridge.ts     # Host-side bridge implementation
├── moduleBridge.ts   # Module-side bridge implementation
├── messageTypes.ts   # Message type enumerations
├── payloadSchemas.ts # TypeScript interfaces for payloads
└── __tests__/
    └── bridge.test.ts # Test suite
```

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd message-bridge

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Lint code
npm run lint
```

### Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run watch`: Watch mode for development
- `npm run test`: Run test suite
- `npm run test:watch`: Run tests in watch mode
- `npm run lint`: Lint and fix code style issues

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

See the [AUTHORS](AUTHORS) file for a list of contributors.

## Support

For questions or support, please contact the SchoolPalm development team.
