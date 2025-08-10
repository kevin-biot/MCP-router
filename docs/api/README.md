# Router API Reference

Complete API documentation for the MCP-router smart orchestration system.

## Coming Soon

### Core Router APIs

#### Tool Routing
- `discoverTools()` - Dynamic tool discovery from registered MCP servers
- `routeToolCall()` - Intelligent tool routing with context awareness
- `getToolCapabilities()` - Query available tools and their capabilities

#### Workflow Management  
- `getCurrentState()` - Get diagnostic workflow state for session
- `transitionState()` - Manage workflow state transitions
- `getWorkflowGuidance()` - Provide structured diagnostic guidance

#### Memory Coordination
- `storeMemory()` - Store cross-domain operational memory
- `searchMemory()` - Search for similar patterns across domains
- `getSessionContext()` - Retrieve conversation and operational context

#### Panic Detection
- `checkForPanicSignals()` - Analyze session for destructive patterns
- `enforceWorkflow()` - Guide users back to structured diagnostics
- `getInterventionHistory()` - Track panic prevention effectiveness

### MCP Server Registration
- `registerServer()` - Register new MCP server with router
- `updateServerStatus()` - Health check and capability updates
- `deregisterServer()` - Clean removal of MCP servers

### Authentication & Authorization
- `authenticateUser()` - User identity verification
- `checkPermissions()` - Tool and environment access validation
- `auditAction()` - Log all operations for compliance

## API Response Format

All router APIs return standardized responses:
```typescript
interface RouterResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    requestId: string;
    timestamp: number;
    processingTime: number;
  };
}
```

## Error Codes

- `ROUTER_001` - Tool not found
- `ROUTER_002` - Permission denied
- `ROUTER_003` - Server unavailable
- `ROUTER_004` - Workflow violation
- `ROUTER_005` - Memory operation failed
