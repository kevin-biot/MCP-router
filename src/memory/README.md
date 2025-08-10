# MCP Shared Memory Library

A shared memory and vector database library for Model Context Protocol (MCP) servers, enabling consistent memory operations across all domain-specific MCP servers.

## Overview

This library provides:
- **Unified ChromaDB integration** for vector similarity search
- **JSON fallback storage** when ChromaDB is unavailable  
- **Domain-aware memory management** (files, openshift, router, etc.)
- **Operational incident storage** with structured schemas
- **Cross-domain memory search** and context retrieval
- **Auto-extraction** of tags and context from conversations

## Installation

```bash
# In your MCP server project
npm install file:../MCP-router/src/memory
```

## Quick Start

```typescript
import { SharedMemoryManager, createMemoryTools, createMemoryHandlers } from 'mcp-shared-memory';

// Initialize memory manager
const memoryManager = new SharedMemoryManager({
  memoryDir: './memory',
  domain: 'openshift', // or 'files', 'router', etc.
  chromaHost: '127.0.0.1',
  chromaPort: 8000
});

await memoryManager.initialize();

// Get MCP tools and handlers
const memoryTools = createMemoryTools(memoryManager);
const memoryHandlers = createMemoryHandlers(memoryManager);

// Register tools with your MCP server
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [...yourOtherTools, ...memoryTools]
}));

// Register handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (memoryHandlers[name]) {
    return { content: [{ type: "text", text: JSON.stringify(await memoryHandlers[name](args)) }] };
  }
  
  // Handle your other tools...
});
```

## Memory Types

### Conversation Memory
Store and retrieve conversation exchanges with automatic context extraction:

```typescript
await memoryManager.storeConversation({
  sessionId: "session_123",
  timestamp: Date.now(),
  userMessage: "My pods are crashing in production",
  assistantResponse: "Let's check the pod events and logs...",
  context: ["production", "pods"],
  tags: ["kubernetes", "crash", "troubleshooting"]
});
```

### Operational Memory  
Store structured incident data for pattern recognition:

```typescript
await memoryManager.storeOperational({
  incidentId: "INC-2024-001",
  timestamp: Date.now(),
  symptoms: ["Pod CrashLoopBackOff", "High memory usage"],
  rootCause: "Memory limit too low",
  resolution: "Increased memory requests and limits",
  environment: "prod",
  affectedResources: ["my-app-deployment", "my-app-pods"],
  diagnosticSteps: ["Checked pod events", "Analyzed resource usage", "Reviewed logs"]
});
```

## Available Tools

When you import this library, your MCP server automatically gets these tools:

### `store_conversation_memory`
Store conversation exchanges with auto-extraction of technical terms and context.

### `store_operational_memory`  
Store operational incidents, outages, and resolution patterns.

### `search_conversation_memory`
Find similar conversations based on semantic similarity.

### `search_operational_memory`
Find similar operational incidents filtered by environment and domain.

### `get_session_context`
Get contextual summary of a conversation session.

## Configuration

```typescript
interface SharedMemoryConfig {
  chromaHost?: string;        // Default: "127.0.0.1"
  chromaPort?: number;        // Default: 8000
  memoryDir: string;          // Local storage directory
  domain: string;             // MCP server domain (files, openshift, etc.)
  namespace?: string;         // Optional multi-tenant namespace
}
```

## Domain Integration

### For OpenShift MCP Server
```typescript
const memoryManager = new SharedMemoryManager({
  memoryDir: './memory',
  domain: 'openshift',
  namespace: 'ops-team'
});
```

### For Files MCP Server  
```typescript
const memoryManager = new SharedMemoryManager({
  memoryDir: './memory', 
  domain: 'files',
  namespace: 'development'
});
```

## Auto-Extraction Features

The library automatically extracts:

**Technical Tags:**
- kubernetes, k8s, openshift, docker, container
- pod, deployment, service, ingress, configmap, secret  
- cpu, memory, storage, network, dns
- error, warning, failure, timeout, crash
- dev, test, staging, prod

**Context Patterns:**
- File paths (`/path/to/file`)
- URLs (`https://example.com`)  
- Kubernetes resource names (`my-app.namespace.svc`)
- Environment variables (`MY_VAR`)

## Fallback Mode

If ChromaDB is unavailable, the library automatically falls back to:
- JSON file storage for persistence
- Simple text-based search for retrieval
- Full functionality maintained

## Memory Namespaces

Use namespaces to separate memory by team or environment:

```typescript
// Operations team memory
const opsMemory = new SharedMemoryManager({
  domain: 'openshift',
  namespace: 'ops-team',
  memoryDir: './memory'
});

// Development team memory  
const devMemory = new SharedMemoryManager({
  domain: 'openshift', 
  namespace: 'dev-team',
  memoryDir: './memory'
});
```

## Error Handling

The library includes comprehensive error handling:
- ChromaDB connection failures → JSON fallback
- Invalid memory data → Structured error responses
- Search failures → Empty results with error logging
- File system issues → Graceful degradation

## Performance

- **Vector similarity search** when ChromaDB available
- **JSON text search fallback** when ChromaDB unavailable
- **Automatic backup** to JSON for all memories
- **Efficient metadata filtering** by domain, environment, session

## Best Practices

1. **Initialize early** in your MCP server startup
2. **Use descriptive session IDs** for better context retrieval
3. **Tag operational memories** with relevant technical terms
4. **Set appropriate environment classifications** (dev/test/staging/prod)
5. **Store diagnostic steps** in operational memories for pattern learning

## Troubleshooting

**ChromaDB Connection Issues:**
```bash
# Start ChromaDB server
chroma run --host 127.0.0.1 --port 8000
```

**Permission Issues:**
```bash
# Ensure memory directory is writable
mkdir -p ./memory
chmod 755 ./memory
```

**Import Issues:**
```bash
# Build the TypeScript
cd /Users/kevinbrown/MCP-router/src/memory
npm run build
```
