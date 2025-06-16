"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/common/components/atoms/button";
import { Textarea } from "@/common/components/atoms/textarea";
import { ScrollArea } from "@/common/components/atoms/scroll-area";
import {
  LucideSparkle,
  Send,
  User,
  Bot,
  Loader2,
  Settings,
  Check,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "config";
  spaceConfig?: any; // JSON space configuration from AI
  configApplied?: boolean;
  aiType?: "planner" | "builder"; // Track which AI responded
  builderResponse?: any; // Store the actual builder response data
}

interface WebSocketMessage {
  type: "user_message" | "ai_response" | "status_update";
  data: {
    message?: string;
    response?: Message;
    aiType?: "planner" | "builder";
    loadingType?: "thinking" | "building";
    status?: "thinking" | "building" | "complete" | "error";
    sessionId?: string;
    context?: any; // Space context for AI
  };
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface AiChatSidebarProps {
  onClose: () => void;
  onApplySpaceConfig?: (config: any) => Promise<void>;
  wsUrl?: string; // WebSocket URL for AI communication
  spaceContext?: any; // Current space context to send with messages
}

export const AiChatSidebar: React.FC<AiChatSidebarProps> = ({
  onClose,
  onApplySpaceConfig,
  wsUrl = "ws://localhost:8080/ai-chat",
  spaceContext,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI assistant for customizing your space. I can help you:\n\n• Add and configure fidgets\n• Adjust themes and colors\n• Modify layouts and styling\n• Suggest improvements\n\nWhat would you like to customize today?",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<
    "thinking" | "building" | null
  >(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Enhanced reconnection with exponential backoff
  const reconnectWithBackoff = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log("Max reconnection attempts reached");
      toast.error("Unable to connect to AI service. Please try again later.");
      return;
    }

    const delay = Math.min(
      1000 * Math.pow(2, reconnectAttempts.current),
      10000
    );
    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`
    );

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttempts.current++;
      // Call connectWebSocket recursively for reconnection
      connectWebSocket();
    }, delay);
  }, []);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      setConnectionStatus("connecting");
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setConnectionStatus("connected");
        reconnectAttempts.current = 0;

        // Send session initialization
        const initMessage: WebSocketMessage = {
          type: "user_message",
          data: {
            sessionId,
            context: spaceContext,
            message: "INIT_SESSION",
          },
        };
        wsRef.current?.send(JSON.stringify(initMessage));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const wsMessage: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(wsMessage);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setConnectionStatus("disconnected");
        setIsLoading(false);
        setLoadingType(null);

        // Attempt to reconnect if not manually closed
        if (
          event.code !== 1000 &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          reconnectWithBackoff();
        } else if (event.code !== 1000) {
          toast.error("Connection lost. Please try reconnecting manually.");
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("error");
        toast.error("Connection error. Trying to reconnect...");
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      setConnectionStatus("error");
      toast.error("Failed to connect to AI service");
    }
  }, [wsUrl, sessionId, spaceContext]);

  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected");
      wsRef.current = null;
    }
    setConnectionStatus("disconnected");
  }, []);

  const handleWebSocketMessage = useCallback((wsMessage: WebSocketMessage) => {
    switch (wsMessage.type) {
      case "ai_response":
        if (wsMessage.data.response) {
          setMessages((prev) => [...prev, wsMessage.data.response!]);
          setIsLoading(false);
          setLoadingType(null);
        }
        break;

      case "status_update":
        if (wsMessage.data.status === "thinking") {
          setLoadingType("thinking");
          setIsLoading(true);
        } else if (wsMessage.data.status === "building") {
          setLoadingType("building");
          setIsLoading(true);
        } else if (wsMessage.data.status === "complete") {
          setIsLoading(false);
          setLoadingType(null);
        } else if (wsMessage.data.status === "error") {
          setIsLoading(false);
          setLoadingType(null);
          toast.error("AI processing error");
        }
        break;

      default:
        console.log("Unknown WebSocket message type:", wsMessage.type);
    }
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Send message via WebSocket if connected
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const wsMessage: WebSocketMessage = {
          type: "user_message",
          data: {
            message: userMessage.content,
            sessionId,
            context: spaceContext,
          },
        };

        wsRef.current.send(JSON.stringify(wsMessage));
      } else {
        // Fallback to mock responses if WebSocket is not connected
        console.warn("WebSocket not connected, using mock responses");

        // Mock: Randomly choose between planner and builder for demo
        const aiType = Math.random() > 0.5 ? "planner" : "builder";

        // Set loading type based on AI response type
        setLoadingType(aiType === "planner" ? "thinking" : "building");

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        let mockResponse: Message;

        if (aiType === "builder") {
          // Builder AI: Store actual response and show generic message
          const builderData = {
            spaceConfig: {
              theme: {
                properties: {
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fidgetBackground: "#ffffff",
                  fidgetBorderColor: "#e2e8f0",
                  fidgetBorderWidth: "1px",
                  textColor: "#1a202c",
                },
              },
              fidgets: [
                {
                  type: "feed",
                  settings: {
                    title: "Social Feed",
                    showHeader: true,
                    feedType: "farcaster",
                  },
                  position: { x: 0, y: 0, w: 4, h: 6 },
                },
              ],
            },
            reasoning:
              "Applied modern gradient background with clean white fidgets for professional look",
            changesApplied: [
              "Updated color scheme",
              "Added social feed",
              "Optimized layout",
            ],
          };

          mockResponse = {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: "What do you think about this design?",
            timestamp: new Date(),
            type: "config",
            aiType: "builder",
            builderResponse: builderData,
            spaceConfig: builderData.spaceConfig,
            configApplied: false,
          };
        } else {
          // Planner AI: Show the actual planning response
          mockResponse = getMockAiResponse(userMessage.content);
          mockResponse.aiType = "planner";
        }

        setMessages((prev) => [...prev, mockResponse]);
        setIsLoading(false);
        setLoadingType(null);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  const handleApplyConfig = async (message: Message) => {
    if (!message.spaceConfig || !onApplySpaceConfig) return;

    try {
      await onApplySpaceConfig(message.spaceConfig);

      // Mark config as applied
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, configApplied: true } : msg
        )
      );

      toast.success("Space configuration applied successfully!");
    } catch (error) {
      console.error("Failed to apply space config:", error);
      toast.error("Failed to apply configuration. Please try again.");
    }
  };

  const getMockAiResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();

    // Return configuration when user asks to apply/implement something
    if (
      input.includes("apply") ||
      input.includes("implement") ||
      input.includes("set up") ||
      input.includes("create space")
    ) {
      return {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content:
          "Perfect! I've prepared a custom space configuration based on our conversation. This will update your theme colors, add the requested fidgets, and optimize your layout.\n\n**Changes included:**\n• Updated color scheme\n• Added social media feed fidget\n• Improved mobile layout\n• Enhanced typography\n\nClick 'Apply Configuration' below to implement these changes.",
        timestamp: new Date(),
        type: "config",
        spaceConfig: {
          theme: {
            properties: {
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fidgetBackground: "#ffffff",
              fidgetBorderColor: "#e2e8f0",
              fidgetBorderWidth: "1px",
              textColor: "#1a202c",
            },
          },
          fidgets: [
            {
              type: "feed",
              settings: {
                title: "Social Feed",
                showHeader: true,
                feedType: "farcaster",
              },
              position: { x: 0, y: 0, w: 4, h: 6 },
            },
          ],
          layout: {
            gridSpacing: 12,
            mobileOptimized: true,
          },
        },
        configApplied: false,
      };
    }

    if (input.includes("theme") || input.includes("color")) {
      return {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content:
          "I can help you customize your theme! Here are some suggestions:\n\n• **Background Colors**: Try gradient backgrounds or solid colors that match your brand\n• **Fidget Themes**: Set consistent colors across all your fidgets\n• **Typography**: Choose fonts that reflect your style\n\nWould you like me to suggest specific color schemes or help you configure a particular theme setting?",
        timestamp: new Date(),
        type: "text",
      };
    }

    if (input.includes("fidget") || input.includes("widget")) {
      return {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content:
          "Great choice! I can help you add and configure fidgets. Here are some popular options:\n\n• **Feed Fidget**: Display your social media feeds\n• **Text Fidget**: Add custom text and links\n• **Gallery Fidget**: Showcase images or NFTs\n• **Market Data**: Display crypto or stock prices\n\nWhich type of fidget interests you most? I can walk you through the setup process.",
        timestamp: new Date(),
        type: "text",
      };
    }

    if (
      input.includes("layout") ||
      input.includes("arrange") ||
      input.includes("organize")
    ) {
      return {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content:
          "I'll help you optimize your layout! Consider these tips:\n\n• **Grid Organization**: Group related fidgets together\n• **Visual Balance**: Mix different sized fidgets for interest\n• **Priority Placement**: Put your most important content in the top-left area\n• **Mobile View**: Ensure your layout works well on mobile devices\n\nWhat specific layout challenge are you facing?",
        timestamp: new Date(),
        type: "text",
      };
    }

    return {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content:
        "I understand you'd like help with customization. I can assist with:\n\n• **Themes & Styling**: Colors, fonts, backgrounds\n• **Fidget Management**: Adding, configuring, and arranging fidgets\n• **Layout Optimization**: Making your space look professional\n• **Best Practices**: Tips for engaging content\n\nCould you be more specific about what you'd like to work on? For example, 'help me choose a color scheme' or 'add a social media feed'.",
      timestamp: new Date(),
      type: "text",
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <aside
      className="h-screen flex-row flex bg-white transition-transform border-r"
      aria-label="AI Chat Sidebar"
    >
      <div className="flex-1 w-[350px] h-full max-h-screen pt-4 flex-col flex overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <LucideSparkle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">AI Customization</h2>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">
                  Your space design assistant
                </p>
                {/* Connection Status Indicator */}
                <div className="flex items-center gap-1">
                  {connectionStatus === "connected" && (
                    <>
                      <Wifi className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">Connected</span>
                    </>
                  )}
                  {connectionStatus === "connecting" && (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-yellow-500" />
                      <span className="text-xs text-yellow-600">
                        Connecting...
                      </span>
                    </>
                  )}
                  {connectionStatus === "disconnected" && (
                    <>
                      <WifiOff className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">Offline</span>
                    </>
                  )}
                  {connectionStatus === "error" && (
                    <>
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-600">Error</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-2">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white ml-auto"
                      : message.aiType === "builder"
                        ? "bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 text-gray-900"
                        : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {/* Builder AI indicator */}
                  {message.aiType === "builder" && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-purple-600 font-medium">
                      <Settings className="w-3 h-3" />
                      Space Builder AI
                    </div>
                  )}

                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>

                  {/* Configuration Apply Button */}
                  {message.type === "config" && message.spaceConfig && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {/* Show builder response data for debugging */}
                      {message.aiType === "builder" &&
                        message.builderResponse && (
                          <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                            <div className="font-medium mb-1">
                              Builder Response Data:
                            </div>
                            <div className="text-gray-600">
                              <div>
                                <strong>Reasoning:</strong>{" "}
                                {message.builderResponse.reasoning}
                              </div>
                              <div>
                                <strong>Changes:</strong>{" "}
                                {message.builderResponse.changesApplied?.join(
                                  ", "
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      <Button
                        onClick={() => handleApplyConfig(message)}
                        disabled={message.configApplied}
                        size="sm"
                        className={`w-full ${
                          message.configApplied
                            ? "bg-green-500 hover:bg-green-500"
                            : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        }`}
                      >
                        {message.configApplied ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Configuration Applied
                          </>
                        ) : (
                          <>
                            <Settings className="w-4 h-4 mr-2" />
                            Apply Configuration
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  <div
                    className={`text-xs mt-1 opacity-70 ${
                      message.role === "user"
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">
                      {loadingType === "thinking" && "Thinking..."}
                      {loadingType === "building" && "Building..."}
                      {!loadingType && "AI is processing..."}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me to customize your space..."
              className="flex-1 min-h-[40px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="self-end bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>

          {/* Reconnect button when disconnected */}
          {(connectionStatus === "disconnected" ||
            connectionStatus === "error") && (
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={connectWebSocket}
                className="text-xs h-7 w-full"
              >
                <Wifi className="w-3 h-3 mr-1" />
                Reconnect to AI
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-4">
          <div className="text-xs font-medium text-gray-700 mb-2">
            Quick Actions:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Help me choose a color theme")}
              className="text-xs h-8"
            >
              🎨 Pick Colors
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Add a social media feed fidget")}
              className="text-xs h-8"
            >
              📱 Add Feed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Apply a modern design to my space")}
              className="text-xs h-8"
            >
              � Apply Design
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setInputValue("Make my space look more professional")
              }
              className="text-xs h-8"
            >
              ✨ Polish Style
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AiChatSidebar;
