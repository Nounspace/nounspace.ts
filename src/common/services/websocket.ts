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
   * Connect to WebSocket server
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

        // Send session initialization with space context
        this.sendSessionInit();
        
        // Auto-send current space context if available
        if (this.config.spaceContext) {
          console.log("🚀 Auto-sending space context after connection established");
          setTimeout(() => {
            this.sendSpaceContext();
          }, 100); // Small delay to ensure session init is processed first
        }
      };

      this.ws.onmessage = (event) => {
        console.log("📨 WebSocket message received:", event.data);
        try {
          const message = JSON.parse(event.data);
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
   * Disconnect from WebSocket server
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
   * Send a message through WebSocket
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
   * Send a ping message for connectivity testing
   */
  ping(): boolean {
    const pingMessage = {
      name: this.config.userFid || null,
      message: "ping",
    };
    
    console.log("Sending ping with FID:", pingMessage);
    return this.send(pingMessage);
  }

  /**
   * Send a user message to the AI
   */
  sendUserMessage(message: string): boolean {
    // Prepare the space context as a stringified JSON for the backend
    const stringifiedContext = this.config.spaceContext ? 
      JSON.stringify(this.config.spaceContext, null, 2) : null;
    
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
    console.log("  Context Size:", stringifiedContext ? stringifiedContext.length : 0, "chars");
    console.log("  User FID:", this.config.userFid);
    console.log("  Session ID:", this.config.sessionId);

    return this.send(wsMessage);
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Update space context for future messages
   */
  updateSpaceContext(context: any): void {
    console.log("🔄 Updating space context in WebSocket service");
    console.log("  Previous context size:", this.config.spaceContext ? JSON.stringify(this.config.spaceContext).length : 0, "chars");
    console.log("  New context size:", context ? JSON.stringify(context).length : 0, "chars");
    
    this.config.spaceContext = context;
    
    // Automatically send the updated context to the server if connected
    if (this.isConnected() && context) {
      console.log("🚀 Auto-sending updated space context to server");
      this.sendSpaceContext();
    } else if (!this.isConnected()) {
      console.log("⏳ WebSocket not connected, context will be sent when connection is established");
    } else {
      console.log("⚠️ No context provided to update");
    }
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
      message: "current_space_config",
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
      message: contextMessage.message,
      hasContext: !!stringifiedContext,
      contextLength: stringifiedContext?.length || 0,
    });
    
    return this.send(contextMessage);
  }

  /**
   * Send session initialization message with space context
   */
  private sendSessionInit(): void {
    // Prepare the space context as a stringified JSON for the backend
    const stringifiedContext = this.config.spaceContext ? 
      JSON.stringify(this.config.spaceContext, null, 2) : null;
    
    const initMessage = {
      name: "init",
      message: "session_initialized",
      sessionId: this.config.sessionId,
      fid: this.config.userFid,
      spaceContext: stringifiedContext, // Send as stringified JSON
      context: stringifiedContext, // Also include in context field
      timestamp: new Date().toISOString(),
    };
    
    console.log("📤 Sending session initialization with space context:");
    console.log("  Session ID:", this.config.sessionId);
    console.log("  User FID:", this.config.userFid);
    console.log("  Context Size:", stringifiedContext ? stringifiedContext.length : 0, "chars");
    console.log("  Context Keys:", this.config.spaceContext ? Object.keys(this.config.spaceContext) : null);
    console.log("  Context Preview:", stringifiedContext ? stringifiedContext.substring(0, 200) + "..." : null);
    console.log("  Init Message Structure:", {
      name: initMessage.name,
      message: initMessage.message,
      hasContext: !!stringifiedContext,
      contextLength: stringifiedContext?.length || 0,
    });
    
    this.send(initMessage);
  }

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
}
