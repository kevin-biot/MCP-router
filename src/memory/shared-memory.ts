// Shared Memory Library for All MCP Servers
// /Users/kevinbrown/MCP-router/src/memory/shared-memory.ts

import { ChromaClient } from 'chromadb';
import { DefaultEmbeddingFunction } from '@chroma-core/default-embed';
import { promises as fs } from 'fs';
import path from 'path';
import type { ToolSchema } from "@modelcontextprotocol/sdk/types.js";

export interface ConversationMemory {
  sessionId: string;
  timestamp: number;
  userMessage: string;
  assistantResponse: string;
  context: string[];
  tags: string[];
  domain?: string; // 'files', 'openshift', 'router', etc.
}

export interface OperationalMemory {
  incidentId: string;
  domain: string; // 'openshift', 'kubernetes', etc.
  timestamp: number;
  symptoms: string[];
  rootCause?: string;
  resolution?: string;
  tags: string[];
  environment: 'dev' | 'test' | 'staging' | 'prod';
  affectedResources: string[];
  diagnosticSteps: string[];
}

export interface MemorySearchResult {
  content: string;
  metadata: any;
  distance: number;
  type: 'conversation' | 'operational' | 'pattern';
}

export interface SharedMemoryConfig {
  chromaHost?: string;
  chromaPort?: number;
  memoryDir: string;
  domain: string; // Which MCP server this is (files, openshift, router)
  namespace?: string; // Optional namespace for multi-tenant scenarios
}

export class SharedMemoryManager {
  private client: ChromaClient | null;
  private conversationCollection: any;
  private operationalCollection: any;
  private memoryDir: string;
  private domain: string;
  private namespace: string;
  private initialized = false;

  constructor(config: SharedMemoryConfig) {
    this.memoryDir = config.memoryDir;
    this.domain = config.domain;
    this.namespace = config.namespace || 'default';
    
    try {
      // Connect to ChromaDB HTTP server
      this.client = new ChromaClient({
        host: config.chromaHost || "127.0.0.1",
        port: config.chromaPort || 8000
      });
      
      console.log(`✓ [${this.domain}] ChromaDB client initialized`);
    } catch (error) {
      console.error(`[${this.domain}] ChromaDB initialization failed, using JSON-only mode:`, error);
      this.client = null;
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure memory directory exists
      await fs.mkdir(this.memoryDir, { recursive: true });

      if (this.client) {
        try {
          // Create or get conversation collection
          this.conversationCollection = await this.client.getOrCreateCollection({
            name: `conversations_${this.namespace}`,
            embeddingFunction: new DefaultEmbeddingFunction()
          });

          // Create or get operational collection for incidents/patterns
          this.operationalCollection = await this.client.getOrCreateCollection({
            name: `operational_${this.namespace}`,
            embeddingFunction: new DefaultEmbeddingFunction()
          });

          console.log(`✓ [${this.domain}] ChromaDB collections ready`);
        } catch (error) {
          console.error(`[${this.domain}] ChromaDB collection setup failed:`, error);
          this.client = null;
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error(`[${this.domain}] Memory initialization failed:`, error);
      throw error;
    }
  }

  // Store conversation memory
  async storeConversation(memory: Omit<ConversationMemory, 'domain'>): Promise<string> {
    const fullMemory = { ...memory, domain: this.domain };
    const memoryId = `${fullMemory.sessionId}_${fullMemory.timestamp}`;

    try {
      // Store in JSON for backup
      await this.storeAsJson(fullMemory, 'conversations');

      // Store in ChromaDB if available
      if (this.client && this.conversationCollection) {
        const content = `User: ${fullMemory.userMessage}\nAssistant: ${fullMemory.assistantResponse}`;
        const metadata = {
          sessionId: fullMemory.sessionId,
          timestamp: fullMemory.timestamp,
          domain: fullMemory.domain,
          tags: fullMemory.tags,
          context: fullMemory.context
        };

        await this.conversationCollection.add({
          ids: [memoryId],
          documents: [content],
          metadatas: [metadata]
        });
      }

      return memoryId;
    } catch (error) {
      console.error(`[${this.domain}] Failed to store conversation:`, error);
      throw error;
    }
  }

  // Store operational memory (incidents, patterns)
  async storeOperational(memory: Omit<OperationalMemory, 'domain'>): Promise<string> {
    const fullMemory = { ...memory, domain: this.domain };
    const memoryId = `${fullMemory.incidentId}_${fullMemory.timestamp}`;

    try {
      // Store in JSON for backup
      await this.storeAsJson(fullMemory, 'operational');

      // Store in ChromaDB if available
      if (this.client && this.operationalCollection) {
        const content = `Symptoms: ${fullMemory.symptoms.join(', ')}
Root Cause: ${fullMemory.rootCause || 'Unknown'}
Resolution: ${fullMemory.resolution || 'Pending'}
Diagnostic Steps: ${fullMemory.diagnosticSteps.join(', ')}`;

        const metadata = {
          incidentId: fullMemory.incidentId,
          domain: fullMemory.domain,
          timestamp: fullMemory.timestamp,
          environment: fullMemory.environment,
          tags: fullMemory.tags,
          affectedResources: fullMemory.affectedResources
        };

        await this.operationalCollection.add({
          ids: [memoryId],
          documents: [content],
          metadatas: [metadata]
        });
      }

      return memoryId;
    } catch (error) {
      console.error(`[${this.domain}] Failed to store operational memory:`, error);
      throw error;
    }
  }

  // Search similar conversations
  async searchConversations(query: string, limit: number = 5, sessionId?: string): Promise<MemorySearchResult[]> {
    try {
      if (!this.client || !this.conversationCollection) {
        return this.searchJsonFallback(query, 'conversations', limit);
      }

      const whereFilter = sessionId ? { sessionId } : undefined;
      
      const results = await this.conversationCollection.query({
        queryTexts: [query],
        nResults: limit,
        where: whereFilter
      });

      return this.formatResults(results, 'conversation');
    } catch (error) {
      console.error(`[${this.domain}] Conversation search failed:`, error);
      return [];
    }
  }

  // Search similar operational patterns
  async searchOperational(
    query: string, 
    limit: number = 5, 
    environment?: string,
    domain?: string
  ): Promise<MemorySearchResult[]> {
    try {
      if (!this.client || !this.operationalCollection) {
        return this.searchJsonFallback(query, 'operational', limit);
      }

      const whereFilter: any = {};
      if (environment) whereFilter.environment = environment;
      if (domain) whereFilter.domain = domain;

      const results = await this.operationalCollection.query({
        queryTexts: [query],
        nResults: limit,
        where: Object.keys(whereFilter).length > 0 ? whereFilter : undefined
      });

      return this.formatResults(results, 'operational');
    } catch (error) {
      console.error(`[${this.domain}] Operational search failed:`, error);
      return [];
    }
  }

  // Get session context summary
  async getSessionContext(sessionId: string): Promise<any> {
    try {
      const conversations = await this.searchConversations('', 50, sessionId);
      
      if (conversations.length === 0) {
        return { sessionId, summary: 'No previous context found', messageCount: 0 };
      }

      // Analyze conversation patterns
      const tags = new Set<string>();
      const domains = new Set<string>();
      
      conversations.forEach(conv => {
        if (conv.metadata.tags) conv.metadata.tags.forEach((tag: string) => tags.add(tag));
        if (conv.metadata.domain) domains.add(conv.metadata.domain);
      });

      return {
        sessionId,
        messageCount: conversations.length,
        domains: Array.from(domains),
        commonTags: Array.from(tags),
        lastActivity: Math.max(...conversations.map(c => c.metadata.timestamp)),
        summary: `Session with ${conversations.length} messages across ${domains.size} domains`
      };
    } catch (error) {
      console.error(`[${this.domain}] Session context retrieval failed:`, error);
      return { sessionId, error: error.message };
    }
  }

  // Utility: Extract tags from text content
  extractTags(text: string): string[] {
    const tags = new Set<string>();
    
    // Technical terms
    const techPatterns = [
      /\b(kubernetes|k8s|openshift|docker|container)\b/gi,
      /\b(pod|deployment|service|ingress|configmap|secret)\b/gi,
      /\b(cpu|memory|storage|network|dns)\b/gi,
      /\b(error|warning|failure|timeout|crash)\b/gi,
      /\b(scale|restart|apply|delete|create)\b/gi,
      /\b(dev|test|staging|prod|production)\b/gi
    ];

    techPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => tags.add(match.toLowerCase()));
      }
    });

    return Array.from(tags);
  }

  // Utility: Extract context from conversation
  extractContext(userMessage: string, assistantResponse: string): string[] {
    const context = new Set<string>();
    
    // Look for file paths, URLs, resource names
    const contextPatterns = [
      /\/[\w\-\/\.]+/g, // File paths
      /https?:\/\/[\w\-\.\/]+/g, // URLs
      /\b[\w\-]+\.[\w\-]+\.[\w\-]+\b/g, // Kubernetes resource names
      /\b[A-Z][A-Z0-9_]*\b/g // Environment variables, constants
    ];

    const allText = `${userMessage} ${assistantResponse}`;
    
    contextPatterns.forEach(pattern => {
      const matches = allText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match.length > 3 && match.length < 100) {
            context.add(match);
          }
        });
      }
    });

    return Array.from(context);
  }

  // Private helper methods
  private async storeAsJson(data: any, type: string): Promise<void> {
    const filename = `${type}_${Date.now()}.json`;
    const filepath = path.join(this.memoryDir, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  }

  private async searchJsonFallback(query: string, type: string, limit: number): Promise<MemorySearchResult[]> {
    // Simple text-based search fallback when ChromaDB is not available
    try {
      const files = await fs.readdir(this.memoryDir);
      const jsonFiles = files.filter(f => f.startsWith(type) && f.endsWith('.json'));
      
      const results: MemorySearchResult[] = [];
      
      for (const file of jsonFiles.slice(-limit * 2)) { // Check more files than needed
        try {
          const content = await fs.readFile(path.join(this.memoryDir, file), 'utf8');
          const data = JSON.parse(content);
          
          const searchText = JSON.stringify(data).toLowerCase();
          if (searchText.includes(query.toLowerCase())) {
            results.push({
              content: searchText,
              metadata: data,
              distance: 0.5, // Fallback similarity score
              type: type as any
            });
          }
        } catch (error) {
          // Skip corrupted files
        }
      }
      
      return results.slice(0, limit);
    } catch (error) {
      console.error(`[${this.domain}] JSON fallback search failed:`, error);
      return [];
    }
  }

  private formatResults(chromaResults: any, type: 'conversation' | 'operational'): MemorySearchResult[] {
    if (!chromaResults.documents || !chromaResults.documents[0]) return [];
    
    return chromaResults.documents[0].map((doc: string, index: number) => ({
      content: doc,
      metadata: chromaResults.metadatas[0][index],
      distance: chromaResults.distances[0][index],
      type
    }));
  }
}

// Memory tools that any MCP server can register
export function createMemoryTools(memoryManager: SharedMemoryManager): Array<{
  name: string;
  description: string;
  inputSchema: any;
}> {
  return [
    {
      name: "store_conversation_memory",
      description: "Store a conversation exchange in vector memory for future retrieval",
      inputSchema: {
        type: "object",
        properties: {
          sessionId: { type: "string", description: "Unique session identifier" },
          userMessage: { type: "string", description: "The user's message" },
          assistantResponse: { type: "string", description: "The assistant's response" },
          context: { 
            type: "array", 
            items: { type: "string" },
            description: "Additional context items (optional)",
            default: []
          },
          tags: { 
            type: "array", 
            items: { type: "string" },
            description: "Tags for categorizing this memory (optional)",
            default: []
          },
          autoExtract: {
            type: "boolean",
            description: "Automatically extract tags and context from messages",
            default: true
          }
        },
        required: ["sessionId", "userMessage", "assistantResponse"]
      }
    },
    {
      name: "store_operational_memory",
      description: "Store operational incident or pattern in memory for future reference",
      inputSchema: {
        type: "object",
        properties: {
          incidentId: { type: "string", description: "Unique incident identifier" },
          symptoms: { 
            type: "array", 
            items: { type: "string" },
            description: "List of observed symptoms" 
          },
          rootCause: { type: "string", description: "Root cause analysis" },
          resolution: { type: "string", description: "How the issue was resolved" },
          environment: { 
            type: "string", 
            enum: ["dev", "test", "staging", "prod"],
            description: "Environment where incident occurred" 
          },
          affectedResources: {
            type: "array",
            items: { type: "string" },
            description: "List of affected resources"
          },
          diagnosticSteps: {
            type: "array", 
            items: { type: "string" },
            description: "Steps taken to diagnose the issue"
          },
          tags: { 
            type: "array", 
            items: { type: "string" },
            description: "Tags for categorizing this incident",
            default: []
          }
        },
        required: ["incidentId", "symptoms", "environment"]
      }
    },
    {
      name: "search_conversation_memory",
      description: "Search previous conversations for relevant context",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          limit: { type: "number", description: "Maximum results to return", default: 5 },
          sessionId: { type: "string", description: "Optional: limit search to specific session" }
        },
        required: ["query"]
      }
    },
    {
      name: "search_operational_memory",
      description: "Search for similar operational incidents or patterns",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query describing current issue" },
          limit: { type: "number", description: "Maximum results to return", default: 5 },
          environment: { 
            type: "string", 
            enum: ["dev", "test", "staging", "prod"],
            description: "Filter by environment" 
          },
          domain: { type: "string", description: "Filter by domain (openshift, kubernetes, etc.)" }
        },
        required: ["query"]
      }
    },
    {
      name: "get_session_context",
      description: "Get contextual summary of a conversation session",
      inputSchema: {
        type: "object",
        properties: {
          sessionId: { type: "string", description: "Session identifier" }
        },
        required: ["sessionId"]
      }
    }
  ];
}

// Memory tool handlers that any MCP server can use
export function createMemoryHandlers(memoryManager: SharedMemoryManager) {
  return {
    async store_conversation_memory(args: any) {
      const { sessionId, userMessage, assistantResponse, context = [], tags = [], autoExtract = true } = args;
      
      let finalTags = [...tags];
      let finalContext = [...context];
      
      if (autoExtract) {
        const extractedTags = memoryManager.extractTags(`${userMessage} ${assistantResponse}`);
        const extractedContext = memoryManager.extractContext(userMessage, assistantResponse);
        
        finalTags = [...new Set([...finalTags, ...extractedTags])];
        finalContext = [...new Set([...finalContext, ...extractedContext])];
      }
      
      const memoryId = await memoryManager.storeConversation({
        sessionId,
        timestamp: Date.now(),
        userMessage,
        assistantResponse,
        context: finalContext,
        tags: finalTags
      });
      
      return {
        success: true,
        memoryId,
        extractedTags: finalTags,
        extractedContext: finalContext
      };
    },

    async store_operational_memory(args: any) {
      const memoryId = await memoryManager.storeOperational({
        ...args,
        timestamp: Date.now()
      });
      
      return {
        success: true,
        memoryId
      };
    },

    async search_conversation_memory(args: any) {
      const { query, limit = 5, sessionId } = args;
      const results = await memoryManager.searchConversations(query, limit, sessionId);
      
      return {
        results: results.map(r => ({
          content: r.content,
          metadata: r.metadata,
          similarity: 1 - r.distance,
          type: r.type
        }))
      };
    },

    async search_operational_memory(args: any) {
      const { query, limit = 5, environment, domain } = args;
      const results = await memoryManager.searchOperational(query, limit, environment, domain);
      
      return {
        results: results.map(r => ({
          content: r.content,
          metadata: r.metadata,
          similarity: 1 - r.distance,
          type: r.type
        }))
      };
    },

    async get_session_context(args: any) {
      const { sessionId } = args;
      return await memoryManager.getSessionContext(sessionId);
    }
  };
}
