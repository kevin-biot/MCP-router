# MCP-router: Smart Routing & Shared Memory for MCP Operations Platform

**The intelligent orchestration layer for Model Context Protocol (MCP) servers, featuring smart routing, workflow enforcement, and shared operational memory.**

## 🎯 **Project Vision**

MCP-router is the "brain" of the MCP Operations Platform - preventing 4 AM operational chaos through intelligent workflow enforcement, cross-domain memory sharing, and panic detection. It transforms multiple domain-specific MCP servers into a unified, intelligent operations platform.

### **Core Capabilities**
- 🧠 **Smart Tool Routing** - Context-aware tool presentation and conflict resolution
- 🔄 **Workflow Enforcement** - Structured diagnostic processes that prevent random troubleshooting  
- 🧩 **Shared Memory System** - Cross-domain operational knowledge and incident correlation
- 🚨 **Panic Detection** - Recognizes and interrupts destructive operational patterns
- 📚 **Universal Memory Library** - Reusable memory components for all MCP servers

## 🏗️ **Architecture Overview**

```
LLM Clients (Claude, LM Studio, Qwen)
         ↓
    MCP-router (Smart Orchestration)
    ├── 🧠 Smart Tool Routing Engine
    ├── 🔄 Workflow State Machine  
    ├── 🚨 Panic Detection System
    ├── 📊 Context Management
    └── 🧩 Memory Coordination
         ↓
┌────────────────┬────────────────┬────────────────┐
│   MCP-files    │   MCP-ocs      │  Future MCPs   │
│   (Files &     │  (OpenShift)   │  (Prometheus,  │
│    Docs)       │                │   Jira, etc.)  │
└────────────────┴────────────────┴────────────────┘
         ↓
   Shared Memory System (ChromaDB + JSON fallback)
   ├── 💬 Cross-domain conversation context
   ├── 🔧 Operational incident database  
   ├── 📋 Diagnostic workflow templates
   └── 🎯 Root cause analysis patterns
```

## 🧠 **Smart Routing Intelligence**

### **Context-Aware Tool Presentation**
```typescript
enum OperationalMode {
  DIAGNOSTIC = 'diagnostic',     // Only read-only investigation tools
  ANALYSIS = 'analysis',         // Pattern matching + memory search
  RESOLUTION = 'resolution',     // Write operations with approval gates
  EMERGENCY = 'emergency'        // Break-glass with heavy audit
}
```

### **Tool Routing Logic**
- **Progressive Disclosure:** Show relevant tools based on conversation context
- **Namespace Conflict Resolution:** Handle overlapping tool names across servers
- **Load Balancing:** Distribute requests across multiple server instances
- **Capability Discovery:** Dynamic tool registration and feature detection

### **Panic Detection Patterns**
```typescript
interface PanicSignal {
  rapidFireCommands: boolean;        // Multiple destructive ops in sequence
  jumpingBetweenDomains: boolean;    // Unfocused investigation 
  bypassingDiagnostics: boolean;     // Requesting fixes without evidence
  escalatingPermissions: boolean;    // Requesting higher access levels
}
```

## 🧩 **Shared Memory Library**

Located in `/src/memory/` - **the crown jewel of the platform**.

### **Universal Memory Interface**
```typescript
interface SharedMemoryConfig {
  chromaHost?: string;
  chromaPort?: number;
  memoryDir: string;
  domain: string;           // 'files', 'openshift', 'router', etc.
  namespace?: string;       // Multi-tenant support
}

class SharedMemoryManager {
  // Store conversation context across all domains
  storeConversation(memory: ConversationMemory): Promise<string>
  
  // Store operational incidents and resolutions  
  storeOperational(memory: OperationalMemory): Promise<string>
  
  // Search for similar patterns across domains
  searchSimilar(query: string, domain?: string): Promise<MemorySearchResult[]>
  
  // Get session context and history
  getSessionContext(sessionId: string): Promise<SessionContext>
}
```

### **Cross-Domain Learning**
- **Pattern Recognition:** "This OpenShift issue is similar to previous Kubernetes incidents"
- **Knowledge Transfer:** Solutions from development environments applicable to production
- **Incident Correlation:** Multiple related incidents automatically grouped
- **Preventive Recommendations:** "Teams often see this after deploying configuration X"

### **Memory Types**

#### **Conversation Memory**
```typescript
interface ConversationMemory {
  sessionId: string;
  domain: string;           // Which MCP server generated this
  userMessage: string;
  assistantResponse: string;
  context: string[];        // Auto-extracted technical terms
  tags: string[];          // Categorization labels
  timestamp: number;
}
```

#### **Operational Memory**
```typescript
interface OperationalMemory {
  incidentId: string;
  domain: string;
  symptoms: string[];       // Observable problems
  rootCause?: string;       // Determined cause  
  resolution?: string;      // Applied solution
  environment: 'dev' | 'test' | 'staging' | 'prod';
  affectedResources: string[];
  diagnosticSteps: string[];
  tags: string[];
}
```

## 🔄 **Workflow Engine**

### **Diagnostic State Machine**
```typescript
enum DiagnosticState {
  GATHERING = 'gathering',           // Evidence collection phase
  ANALYZING = 'analyzing',           // Pattern matching against memory
  HYPOTHESIZING = 'hypothesizing',   // Forming testable theories
  TESTING = 'testing',               // Targeted investigation
  RESOLVING = 'resolving'            // Approved remediation
}
```

### **Workflow Enforcement Rules**
- **No fixes without evidence** - Must complete diagnostic steps
- **Memory-guided decisions** - Reference similar past incidents
- **Approval gates** - Senior engineer sign-off for high-risk operations
- **Audit trails** - Complete decision rationale and memory references

### **Panic Prevention System**
```typescript
class PanicDetector {
  // Monitor for dangerous patterns
  detectRapidFireCommands(commands: Command[], timeWindow: number): boolean
  
  // Interrupt destructive sequences
  enforceStructuredDiagnostics(currentState: DiagnosticState): boolean
  
  // Guide back to methodical approach
  suggestStructuredWorkflow(context: OperationalContext): Workflow
}
```

## 🛠️ **Technical Implementation**

### **Project Structure**
```
MCP-router/
├── src/
│   ├── routing/              # Smart tool routing logic
│   ├── workflow/             # Diagnostic state machine
│   ├── backends/             # MCP server management
│   ├── auth/                 # Authorization and user management
│   ├── memory/               # 🌟 Shared Memory Library
│   │   ├── shared-memory.ts  # Core memory manager
│   │   ├── package.json      # Standalone npm package
│   │   └── README.md         # Memory library documentation
│   ├── monitoring/           # Performance and health metrics
│   └── types/                # TypeScript interfaces
├── tests/
│   ├── unit/                 # Component testing
│   ├── integration/          # End-to-end workflow testing  
│   └── fixtures/             # Mock data and scenarios
├── docs/
│   ├── architecture/         # Technical decision records
│   ├── api/                  # Router API documentation
│   ├── workflows/            # Diagnostic process guides
│   └── deployment/           # Installation and configuration
└── config/                   # Environment configurations
```

### **Shared Memory as Standalone Package**
```typescript
// Any MCP server can import and use
import { 
  SharedMemoryManager, 
  createMemoryTools, 
  createMemoryHandlers 
} from 'mcp-shared-memory';

const memoryManager = new SharedMemoryManager({
  memoryDir: './memory',
  domain: 'openshift'  // or 'files', 'prometheus', etc.
});

const memoryTools = createMemoryTools(memoryManager);
const memoryHandlers = createMemoryHandlers(memoryManager);
```

### **Router API Interface**
```typescript
interface RouterAPI {
  // Tool routing and discovery
  discoverTools(): Promise<ToolMap>
  routeToolCall(toolName: string, args: any, context: Context): Promise<any>
  
  // Workflow management
  getCurrentState(sessionId: string): Promise<DiagnosticState>
  transitionState(sessionId: string, newState: DiagnosticState): Promise<void>
  
  // Memory coordination
  storeMemory(memory: ConversationMemory | OperationalMemory): Promise<string>
  searchMemory(query: string, filters?: MemoryFilters): Promise<MemorySearchResult[]>
  
  // Panic detection
  checkForPanicSignals(session: Session): Promise<PanicAssessment>
  enforceWorkflow(session: Session): Promise<WorkflowGuidance>
}
```

## 🔒 **Security & Safety**

### **Multi-Tenant Memory Isolation**
- **Namespace separation** - Team/organization boundaries
- **Access control** - Role-based memory visibility
- **Data sanitization** - PII and secret redaction
- **Audit logging** - Complete memory access trails

### **Workflow Safety Gates**
- **Environment classification** - dev/test/staging/prod risk levels
- **Approval workflows** - Senior engineer sign-off for critical operations
- **Break-glass procedures** - Emergency access with mandatory postmortem
- **Red-light scenarios** - Operations requiring special authorization

### **Memory Security**
- **Vector embedding isolation** - ChromaDB collection separation
- **JSON backup encryption** - Local storage protection
- **Network security** - TLS for all memory operations
- **Retention policies** - Automatic data lifecycle management

## 📊 **Performance & Monitoring**

### **Router Metrics**
- **Tool routing latency** - Response time per domain
- **Memory search performance** - Vector similarity search speed  
- **Workflow compliance** - % of sessions following structured diagnostics
- **Panic prevention** - Interventions and their effectiveness

### **Memory Metrics**
- **Storage efficiency** - Vector database utilization
- **Search accuracy** - Relevance of similar incident matching
- **Knowledge reuse** - % of incidents matched to existing patterns
- **Cross-domain learning** - Knowledge transfer between domains

### **Operational KPIs**
- **MTTR improvement** - Reduction in incident resolution time
- **First-time fix rate** - Problems solved without escalation
- **Knowledge capture** - % of incidents generating reusable patterns
- **Team learning velocity** - Rate of operational skill improvement

## 🚀 **Development Roadmap**

### **Phase 1: Foundation** (Current)
- ✅ **Shared Memory Library** - Universal memory components
- ✅ **Basic Router Structure** - Directory and package setup
- 🔄 **Memory Integration Testing** - Validate cross-domain storage

### **Phase 2: Smart Routing**
- 🔄 **Tool Discovery** - Dynamic MCP server registration
- 📋 **Context-Aware Routing** - Progressive tool disclosure
- 🔍 **Namespace Conflict Resolution** - Handle overlapping tool names

### **Phase 3: Workflow Engine**
- 🔄 **State Machine Implementation** - Diagnostic workflow enforcement
- 🚨 **Panic Detection** - Pattern recognition for destructive behavior
- 📊 **Workflow Analytics** - Effectiveness measurement and optimization

### **Phase 4: Advanced Intelligence**
- 🤖 **Predictive Recommendations** - Suggest tools based on context
- 📈 **Learning Optimization** - Improve recommendations from usage patterns
- 🔮 **Preventive Suggestions** - Identify potential issues before they occur

## 🤝 **Integration with MCP Ecosystem**

### **MCP Server Registration**
```typescript
// MCP servers register with router
interface MCPServerRegistration {
  name: string;
  endpoint: string;
  capabilities: string[];
  healthCheck: string;
  priority: number;
}
```

### **Memory Library Usage**
```bash
# Install in any MCP server
npm install file:../MCP-router/src/memory

# Import and use
import { SharedMemoryManager } from 'mcp-shared-memory';
```

### **Workflow Integration**
```typescript
// MCP servers report state changes
router.reportStateChange(sessionId, currentState, context);

// Router provides workflow guidance
const guidance = await router.getWorkflowGuidance(sessionId);
```

## 🏁 **Getting Started**

### **Prerequisites**
- Node.js 18+
- ChromaDB server (local or remote)
- Access to target MCP servers
- LLM client with MCP support

### **Installation**
```bash
# Clone repository
git clone https://github.com/kevin-biot/MCP-router.git
cd MCP-router

# Install dependencies
npm install

# Build shared memory library
cd src/memory
npm run build

# Start router (development mode)
cd ../..
npm run dev
```

### **Configuration**
```typescript
// config/router.json
{
  "memory": {
    "chromaHost": "127.0.0.1",
    "chromaPort": 8000,
    "namespace": "operations-team"
  },
  "servers": [
    {
      "name": "files",
      "endpoint": "http://localhost:8080/mcp",
      "capabilities": ["filesystem", "memory"]
    },
    {
      "name": "openshift", 
      "endpoint": "http://localhost:8081/mcp",
      "capabilities": ["kubernetes", "diagnostics"]
    }
  ]
}
```

## 📚 **Documentation**

- **[Architecture Decision Records](./docs/architecture/)** - Technical decisions and rationale *(Coming Soon)*
- **[Router API Reference](./docs/api/)** - Complete API documentation *(Coming Soon)*
- **[Workflow Guide](./docs/workflows/)** - Diagnostic process templates *(Coming Soon)*
- **[Memory Library Guide](./src/memory/README.md)** - Shared memory usage
- **[Deployment Guide](./docs/deployment/)** - Production setup and configuration *(Coming Soon)*

## 🔗 **Related Projects**

- **[MCP-ocs](https://github.com/kevin-biot/MCP-ocs)** - OpenShift Container Platform operations
- **[MCP-files](https://github.com/kevin-biot/MCP-files)** - File system operations and foundation

## 📄 **License**

MIT License - See [LICENSE](./LICENSE) for details

## 📞 **Support**

- **Issues:** GitHub Issues for bug reports and feature requests
- **Discussions:** GitHub Discussions for architecture questions
- **Documentation:** Comprehensive guides in `/docs` directory
- **Memory Library:** Detailed documentation in `/src/memory/README.md`

---

**The intelligent orchestration layer that transforms chaotic operations into structured, AI-assisted excellence.** 🧠

*Built for teams who refuse to accept 4 AM operational chaos as inevitable.*
