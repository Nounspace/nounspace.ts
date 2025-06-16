/**
 * WebSocket Service for AI Chat
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
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(config: WebSocketConfig, callbacks: WebSocketCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      this.callbacks.onStatusChange("connecting");
      this.ws = new WebSocket(this.config.url);

      this.ws.onopen = () => {
        console.log("WebSocket connected to:", this.config.url);
        this.callbacks.onStatusChange("connected");
        this.reconnectAttempts = 0;

        // Send session initialization
        this.sendInitMessage();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.callbacks.onMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
          this.callbacks.onError("Failed to parse server message");
        }
      };

      this.ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        this.callbacks.onStatusChange("disconnected");

        // Attempt to reconnect if not manually closed
        if (
          event.code !== 1000 && 
          this.reconnectAttempts < (this.config.maxReconnectAttempts || 5)
        ) {
          this.scheduleReconnect();
        } else if (event.code !== 1000) {
          this.callbacks.onError("Connection lost. Please try reconnecting manually.");
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.callbacks.onStatusChange("error");
        this.callbacks.onError("Connection error. Trying to reconnect...");
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
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error("Failed to send WebSocket message:", error);
        this.callbacks.onError("Failed to send message");
        return false;
      }
    } else {
      console.warn("WebSocket not connected, cannot send message");
      this.callbacks.onError("WebSocket not connected");
      return false;
    }
  }

  /**
   * Send a ping message for connectivity testing
   */
  ping(): boolean {
    const pingMessage = {
      name: "ping",
      message: "ping",
      fid: this.config.userFid || null
    };
    
    console.log("Sending ping with FID:", pingMessage);
    return this.send(pingMessage);
  }

  /**
   * Send a user message to the AI
   */
  sendUserMessage(message: string): boolean {
    const wsMessage: WebSocketMessage = {
      type: "user_message",
      data: {
        message,
        sessionId: this.config.sessionId,
        context: this.config.spaceContext,
        fid: this.config.userFid || null,
      },
    };

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
    this.config.spaceContext = context;
  }

  /**
   * Update user FID for future messages
   */
  updateUserFid(fid: number | null): void {
    this.config.userFid = fid;
  }

  /**
   * Send session initialization message
   */
  private sendInitMessage(): void {
    const initMessage = {
      name: "init",
      message: "session_initialized",
    };
    
    console.log("Sending init message:", initMessage);
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
