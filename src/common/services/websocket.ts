/**
 * export interface WebSocketMessage {
  type: "user_message" | "ai_response" | "status_update" | "ping" | "pong" | "REPLY";
  data: {
    message?: string;
    response?: any;
    aiType?: "planner" | "builder";
    loadingType?: "thinking" | "building";
    status?: "thinking" | "building" | "complete" | "error";
    sessionId?: string;
    context?: any;
    timestamp?: string;
    fid?: number | null;
  };
}ice for AI Chat
 * Handles basic WebSocket connection, reconnection, and message handling
 */

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export interface WebSocketMessage {
  type: "user_message" | "ai_response" | "status_update" | "ping" | "pong";
  data: {
    message?: string;
    response?: any;
    aiType?: "planner" | "builder";
    loadingType?: "thinking" | "building";
    status?: "thinking" | "building" | "complete" | "error";
    sessionId?: string;
    context?: any;
    timestamp?: string;
    fid?: number | null;
  };
}

export interface WebSocketConfig {
  url: string;
  sessionId: string;
  maxReconnectAttempts?: number;
  reconnectBackoffMs?: number;
  spaceContext?: any;
  userFid?: number | null;
}

export interface WebSocketCallbacks {
  onStatusChange: (status: ConnectionStatus) => void;
  onMessage: (message: any) => void;
  onError: (error: string) => void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private callbacks: WebSocketCallbacks;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(config: WebSocketConfig, callbacks: WebSocketCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
    
    // Log the configuration being used
    console.log("🔧 WebSocketService: Configuration received");
    console.log("📋 Space Context in WebSocket Service:", {
      hasSpaceContext: !!config.spaceContext,
      spaceContextType: typeof config.spaceContext,
      spaceContextKeys: config.spaceContext ? Object.keys(config.spaceContext) : null,
      spaceContextPreview: config.spaceContext ? 
        JSON.stringify(config.spaceContext).substring(0, 200) + "..." : null,
      userFid: config.userFid,
      sessionId: config.sessionId,
    });
  }

  /**
   * Connect to WebSocket server (WORKING FINE)
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected, skipping connection attempt");
      return; // Already connected
    }

    try {
      console.log("Starting WebSocket connection to:", this.config.url);
      this.callbacks.onStatusChange("connecting");
      this.ws = new WebSocket(this.config.url);

      console.log("WebSocket instance created, readyState:", this.ws.readyState);

      // Set a connection timeout
      this.connectionTimeout = setTimeout(() => {
        console.log("⏰ WebSocket connection timeout after 10 seconds");
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          console.log("Closing WebSocket due to timeout");
          this.ws.close();
          this.callbacks.onStatusChange("error");
          this.callbacks.onError("Connection timeout. Server may be unreachable.");
        }
      }, 10000); // 10 second timeout

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected successfully to:", this.config.url);
        console.log("WebSocket readyState after open:", this.ws?.readyState);
        
        // Clear connection timeout
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        
        this.callbacks.onStatusChange("connected");
        this.reconnectAttempts = 0;

        // Don't auto-send context - only send when user sends a message
        console.log("� WebSocket connected - ready to receive user messages with context");
      };

      this.ws.onmessage = (event) => {
        console.log("📨 WebSocket message received:", event.data);
        
        // DEBUG: Log raw message details
        console.log("📋 RAW MESSAGE DETAILS:");
        console.log("  Data Type:", typeof event.data);
        console.log("  Data Length:", event.data.length);
        console.log("  Raw Data Preview:", event.data.substring(0, 500));
        
        try {
          const message = JSON.parse(event.data);
          console.log("✅ Parsed message successfully:");
          console.log("  Message Type:", message.type);
          console.log("  Has Data Field:", !!message.data);
          if (message.data) {
            console.log("  Data Keys:", Object.keys(message.data));
            console.log("  Has Response:", !!message.data.response);
            console.log("  Has Context:", !!message.data.context);
          }
          
          this.callbacks.onMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
          this.callbacks.onError("Failed to parse server message");
        }
      };

      this.ws.onclose = (event) => {
        console.log("❌ WebSocket disconnected - Code:", event.code, "Reason:", event.reason, "WasClean:", event.wasClean);
        
        // Clear connection timeout
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        
        this.callbacks.onStatusChange("disconnected");

        // Attempt to reconnect if not manually closed
        if (
          event.code !== 1000 && 
          this.reconnectAttempts < (this.config.maxReconnectAttempts || 5)
        ) {
          console.log("Scheduling reconnection attempt...");
          this.scheduleReconnect();
        } else if (event.code !== 1000) {
          console.log("Max reconnection attempts reached or connection manually closed");
          this.callbacks.onError("Connection lost. Please try reconnecting manually.");
        }
      };

      this.ws.onerror = (error) => {
        console.error("💥 WebSocket error occurred:", error);
        console.log("WebSocket readyState during error:", this.ws?.readyState);
        console.log("WebSocket URL attempted:", this.config.url);
        
        // Clear connection timeout
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        
        this.callbacks.onStatusChange("error");
        this.callbacks.onError("Connection error. Check if server is running and accessible.");
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      this.callbacks.onStatusChange("error");
      this.callbacks.onError("Failed to connect to AI service");
    }
  }

  /**
   * Disconnect from WebSocket server (WORKING FINE)
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, "User disconnected");
      this.ws = null;
    }

    this.callbacks.onStatusChange("disconnected");
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Send a ping message for connectivity testing (WORKING FINE)
   */
  ping(): boolean {
    const pingMessage = {
      name: this.config.userFid || null,
      type: "ping",
      message: "ping",
    };
    
    console.log("Sending ping with FID:", pingMessage);
    return this.send(pingMessage);
  }

  /**
   * Send a message through WebSocket (WORKING FINE - NEED TO CHECK ITS USAGE)
   */
  send(message: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        const stringifiedMessage = JSON.stringify(message);
        console.log("🚀 Sending WebSocket message:");
        console.log("  Message Type:", message.type || message.name || "unknown");
        console.log("  Message Size:", stringifiedMessage.length, "chars");
        console.log("  Has Space Context:", !!(message.spaceContext || message.context));
        console.log("  Space Context Size:", message.spaceContext ? 
          (typeof message.spaceContext === 'string' ? message.spaceContext.length : JSON.stringify(message.spaceContext).length) : 0, "chars");
        
        // DEBUG: Log the entire message payload for troubleshooting
        console.log("📋 FULL MESSAGE PAYLOAD:");
        console.log(JSON.stringify(message, null, 2));
        
        this.ws.send(stringifiedMessage);
        console.log("✅ WebSocket message sent successfully");
        return true;
      } catch (error) {
        console.error("❌ Failed to send WebSocket message:", error);
        this.callbacks.onError("Failed to send message");
        return false;
      }
    } else {
      console.warn("⚠️ WebSocket not connected, cannot send message");
      console.log("  WebSocket state:", this.ws ? this.ws.readyState : "null");
      this.callbacks.onError("WebSocket not connected");
      return false;
    }
  }

  /**
   * Send a user message to the AI (WE ARE NOT USING THIS)
   */
  sendUserMessage(message: string, spaceContext?: any): boolean {
    // Use provided context or fall back to stored context
    const contextToUse = spaceContext || this.config.spaceContext;
    
    // Prepare the space context as a stringified JSON for the backend
    const stringifiedContext = contextToUse ? 
      JSON.stringify(contextToUse, null, 2) : null;
    
    const wsMessage: any = {
      type: "user_message",
      message,
      sessionId: this.config.sessionId,
      context: stringifiedContext, // Send as stringified JSON
      spaceContext: stringifiedContext, // Also include in spaceContext field
      fid: this.config.userFid || null,
      name: this.config.userFid || null,
      timestamp: new Date().toISOString(),
    };

    console.log("📤 Sending user message with context:");
    console.log("  Message:", message);
    console.log("  Context Source:", spaceContext ? "provided" : "stored");
    console.log("  Context Size:", stringifiedContext ? stringifiedContext.length : 0, "chars");
    console.log("  User FID:", this.config.userFid);
    console.log("  Session ID:", this.config.sessionId);

    // DEBUG: Log if context contains the expected fields
    if (contextToUse) {
      console.log("  ✅ Context Details:");
      console.log("    Has fidgetInstanceDatums:", !!contextToUse.fidgetInstanceDatums);
      console.log("    Has theme:", !!contextToUse.theme);
      console.log("    Has layoutDetails:", !!contextToUse.layoutDetails);
      console.log("    Context Keys:", Object.keys(contextToUse));
    } else {
      console.log("  ❌ NO CONTEXT PROVIDED");
    }

    return this.send(wsMessage);
  }

  /**
   * Send a test message with context for debugging 
   * (WE ARE NOT USING THIS, BECAUSE WE ARE TESTING THE CONTEXT IN sendUserMessageWithExplicitContext)
   */
  sendTestContextMessage(testMessage: string = "Test message with context"): boolean {
    console.log("🧪 Sending test message with context for debugging:");
    
    const testContext = {
      test: true,
      timestamp: new Date().toISOString(),
      spaceContext: this.config.spaceContext,
      message: "This is a test to verify context is being sent properly"
    };

    const wsMessage: any = {
      type: "user_message",
      message: testMessage,
      sessionId: this.config.sessionId,
      context: JSON.stringify(testContext, null, 2),
      spaceContext: JSON.stringify(testContext, null, 2),
      fid: this.config.userFid || null,
      name: this.config.userFid || null,
      timestamp: new Date().toISOString(),
      isTestMessage: true, // Flag to identify this as a test
    };

    console.log("🧪 Test message payload:");
    console.log(JSON.stringify(wsMessage, null, 2));

    return this.send(wsMessage);
  }

  /**
   * Send a user message with explicit context instructions for the AI 
   * (THIS ONE IS TRYING TO OVERWRITE THE TEMPORARY PROMPT ON VAIPRAONDES SERVER)
   */
  sendUserMessageWithExplicitContext(message: string, spaceContext?: any): boolean {
    const contextToUse = spaceContext || this.config.spaceContext;
    
    // Create a highly structured and explicit instruction for the AI
    const explicitMessage = contextToUse ? 
      `SYSTEM INSTRUCTION: You are analyzing a DIGITAL SPACE CONFIGURATION for a user's dashboard/widget layout. This is NOT about physical rooms.

      **CRITICAL**: The user already has a configured space. DO NOT suggest generic new fidgets. ANALYZE THEIR CURRENT SETUP.

      CURRENT SPACE ANALYSIS:
      ${JSON.stringify(contextToUse, null, 2)}

      CURRENT FIDGETS IN USE:
      ${this.extractFidgetSummary(contextToUse)}

      CURRENT THEME SETTINGS:
      ${this.extractThemeSummary(contextToUse)}

      CURRENT LAYOUT:
      ${this.extractLayoutSummary(contextToUse)}

      USER'S ACTUAL REQUEST: ${message}

      RESPONSE INSTRUCTIONS: 
      - Reference the user's ACTUAL current fidgets (SnapShot, feed, etc.)
      - Reference their ACTUAL theme settings and colors
      - Reference their ACTUAL layout positions and sizes  
      - If they want changes, modify THEIR EXISTING configuration
      - DO NOT suggest generic gallery/text/video fidgets they don't have` 
            : `USER REQUEST: ${message}

      NOTE: No space configuration context available.`;

    const wsMessage: any = {
      type: "user_message", 
      message: explicitMessage,
      sessionId: this.config.sessionId,
      
      // PRIMARY CONTEXT - Backend should prioritize this
      PRIMARY_CONTEXT: contextToUse ? {
        instruction: "ANALYZE USER'S CURRENT CONFIGURATION - DO NOT SUGGEST GENERIC FIDGETS",
        mode: "ANALYZE_EXISTING_NOT_SUGGEST_NEW",
        current_fidgets: this.extractFidgetSummary(contextToUse),
        current_theme: this.extractThemeSummary(contextToUse),
        current_layout: this.extractLayoutSummary(contextToUse),
        user_request: message,
        raw_config: contextToUse
      } : null,
      
      // Backup context fields
      context: contextToUse ? JSON.stringify(contextToUse, null, 2) : null,
      spaceContext: contextToUse ? JSON.stringify(contextToUse, null, 2) : null,
      userSpaceAnalysis: contextToUse ? {
        fidgets: this.extractFidgetSummary(contextToUse),
        theme: this.extractThemeSummary(contextToUse),
        layout: this.extractLayoutSummary(contextToUse)
      } : null,
      
      fid: this.config.userFid || null,
      name: this.config.userFid || null,
      timestamp: new Date().toISOString(),
      explicit_context: true,
      context_priority: "ANALYZE_CURRENT_NOT_SUGGEST_NEW",
    };

    console.log("📤 Sending message with EXPLICIT CONTEXT:");
    console.log("  Original Message:", message);
    console.log("  Enhanced Message Length:", explicitMessage.length);
    console.log("  Has Context:", !!contextToUse);
    if (contextToUse) {
      console.log("  📊 EXTRACTED SUMMARIES:");
      console.log("    Fidgets:", this.extractFidgetSummary(contextToUse));
      console.log("    Theme:", this.extractThemeSummary(contextToUse));  
      console.log("    Layout:", this.extractLayoutSummary(contextToUse));
      console.log("  🎯 PRIMARY_CONTEXT field:", wsMessage.PRIMARY_CONTEXT);
    }

    return this.send(wsMessage);
  }

  /**
   * Update space context for future messages
   */
  updateSpaceContext(context: any): void {
    console.log("🔄 Updating space context in WebSocket service");
    console.log("  Previous context size:", this.config.spaceContext ? JSON.stringify(this.config.spaceContext).length : 0, "chars");
    console.log("  New context size:", context ? JSON.stringify(context).length : 0, "chars");
    
    this.config.spaceContext = context;
    
    // Don't auto-send context updates - only send when user sends a message
    console.log("✅ Space context updated - will be sent with next user message");
  }

  /**
   * Update user FID for future messages
   */
  updateUserFid(fid: number | null): void {
    this.config.userFid = fid;
  }

  /**
   * Send current space context to backend
   */
  sendSpaceContext(): boolean {
    // Prepare the space context as a stringified JSON for the backend
    const stringifiedContext = this.config.spaceContext ? 
      JSON.stringify(this.config.spaceContext, null, 2) : null;
    
    const contextMessage = {
      name: "space_context",
      message: stringifiedContext || "No space context available", // Send actual config as message
      sessionId: this.config.sessionId,
      fid: this.config.userFid,
      spaceContext: stringifiedContext, // Send as stringified JSON
      context: stringifiedContext, // Also include in context field
      timestamp: new Date().toISOString(),
    };
    
    console.log("📤 Sending space context to backend:");
    console.log("  Context Size:", stringifiedContext ? stringifiedContext.length : 0, "chars");
    console.log("  Context Characters Preview:", stringifiedContext ? stringifiedContext.substring(0, 100) + "..." : null);
    console.log("  User FID:", this.config.userFid);
    console.log("  Session ID:", this.config.sessionId);
    console.log("  Full Context Message Structure:", {
      name: contextMessage.name,
      hasMessage: !!contextMessage.message,
      messageLength: contextMessage.message?.length || 0,
      hasContext: !!stringifiedContext,
      contextLength: stringifiedContext?.length || 0,
    });
    
    return this.send(contextMessage);
  }

  /**
   * Send session initialization message with space context (DONT USE, BUT DONT DELETE)
   */
  // private sendSessionInit(): void {
  //   // Prepare the space context as a stringified JSON for the backend
  //   const stringifiedContext = this.config.spaceContext ? 
  //     JSON.stringify(this.config.spaceContext, null, 2) : null;
    
  //   const initMessage = {
  //     name: "init",
  //     message: "session_initialized",
  //     sessionId: this.config.sessionId,
  //     fid: this.config.userFid,
  //     spaceContext: stringifiedContext, // Send as stringified JSON
  //     context: stringifiedContext, // Also include in context field
  //     timestamp: new Date().toISOString(),
  //   };
    
  //   console.log("📤 Sending session initialization with space context:");
  //   console.log("  Session ID:", this.config.sessionId);
  //   console.log("  User FID:", this.config.userFid);
  //   console.log("  Context Size:", stringifiedContext ? stringifiedContext.length : 0, "chars");
  //   console.log("  Context Keys:", this.config.spaceContext ? Object.keys(this.config.spaceContext) : null);
  //   console.log("  Context Preview:", stringifiedContext ? stringifiedContext.substring(0, 200) + "..." : null);
  //   console.log("  Init Message Structure:", {
  //     name: initMessage.name,
  //     message: initMessage.message,
  //     hasContext: !!stringifiedContext,
  //     contextLength: stringifiedContext?.length || 0,
  //   });
    
  //   this.send(initMessage);
  // }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    const maxAttempts = this.config.maxReconnectAttempts || 5;
    const baseDelay = this.config.reconnectBackoffMs || 1000;
    
    if (this.reconnectAttempts >= maxAttempts) {
      this.callbacks.onError("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = baseDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${maxAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.disconnect();
  }

  /**
   * Extract a readable summary of current fidgets
   */
  private extractFidgetSummary(spaceContext: any): string {
    if (!spaceContext?.fidgetInstanceDatums) return "No fidgets configured";
    
    const fidgets = Object.values(spaceContext.fidgetInstanceDatums) as any[];
    return fidgets.map(fidget => {
      const type = fidget.fidgetType || 'unknown';
      const id = fidget.id || 'unnamed';
      const settings = fidget.config?.settings || {};
      const keySettings = Object.entries(settings)
        .filter(([key, value]) => value && !key.includes('var(--') && key !== 'showOnMobile')
        .map(([key, value]) => `${key}: ${value}`)
        .slice(0, 3)
        .join(', ');
      
      return `- ${type} (${id})${keySettings ? `: ${keySettings}` : ''}`;
    }).join('\n');
  }

  /**
   * Extract a readable summary of current theme
   */
  private extractThemeSummary(spaceContext: any): string {
    if (!spaceContext?.theme?.properties) return "No theme configured";
    
    const theme = spaceContext.theme.properties;
    // debug: Log the theme properties
    console.log("📋 Theme Properties:", theme);
    return [
      `Background: ${theme.background || 'default'}`,
      `Font: ${theme.font || 'default'}`,
      `Font Color: ${theme.fontColor || 'default'}`,
      `Fidget Background: ${theme.fidgetBackground || 'default'}`,
      `Border: ${theme.fidgetBorderWidth || 'none'} ${theme.fidgetBorderColor || ''}`.trim()
    ].filter(line => !line.includes('default')).join('\n') || "Default theme settings";
  }

  /**
   * Extract a readable summary of current layout
   */
  private extractLayoutSummary(spaceContext: any): string {
    if (!spaceContext?.layoutDetails?.layoutConfig?.layout) return "No layout configured";
    
    const layout = spaceContext.layoutDetails.layoutConfig.layout;
    return layout.map((item: any) => 
      `- ${item.i}: Position (${item.x}, ${item.y}), Size ${item.w}x${item.h}`
    ).join('\n');
  }
}
