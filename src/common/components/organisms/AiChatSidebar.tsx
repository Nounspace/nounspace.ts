"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Button } from "@/common/components/atoms/button";
import { Textarea } from "@/common/components/atoms/textarea";
import { ScrollArea } from "@/common/components/atoms/scroll-area";
import {
  LucideSparkle,
  Send,
  User,
  Loader2,
  Settings,
  Check,
  AlertCircle,
  Wifi,
  WifiOff,
  Eye,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useSidebarContext } from "./Sidebar";
import {
  WebSocketService,
  ConnectionStatus,
  type WebSocketMessage,
} from "@/common/services/websocket";
import { useCurrentFid } from "@/common/lib/hooks/useCurrentFid";
import { useAppStore } from "@/common/data/stores/app";
import Image from "next/image";

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

interface AiChatSidebarProps {
  onClose: () => void;
  onApplySpaceConfig?: (config: any) => Promise<void>;
  wsUrl?: string; // WebSocket URL for AI communication
  spaceContext?: any; // Current space context to send with messages
}

const DummyTestConfig = {
  fileData:
    '{"fidgetInstanceDatums":{"feed:profile":{"config":{"data":{},"editable":false,"settings":{"feedType":"filter","filterType":"fids","users":2788}},"fidgetType":"feed","id":"feed:profile"},"frame:a5381fd6-bbb4-430b-8cdd-bbda770afd41":{"config":{"editable":true,"settings":{"background":"transparent","fidgetBorderColor":"transparent","fidgetBorderWidth":"transparent","fidgetShadow":"none","url":"https://find.farcaster.info"}},"fidgetType":"frame","id":"frame:a5381fd6-bbb4-430b-8cdd-bbda770afd41","properties":{"fidgetName":"Farcaster Frame","fields":[{"fieldName":"url","inputSelector":{"displayName":"TextInput"},"required":true},{"default":"transparent","fieldName":"background","group":"style","required":false},{"default":"transparent","fieldName":"fidgetBorderWidth","group":"style","required":false},{"default":"transparent","fieldName":"fidgetBorderColor","group":"style","required":false},{"default":"none","fieldName":"fidgetShadow","group":"style","required":false}],"icon":9209,"size":{"maxHeight":36,"maxWidth":36,"minHeight":2,"minWidth":2}}}},"fidgetTrayContents":[],"isPrivate":false,"layoutDetails":{"layoutConfig":{"layout":[{"h":8,"i":"feed:profile","maxH":36,"maxW":36,"minH":6,"minW":4,"moved":false,"static":false,"w":5,"x":0,"y":0},{"h":5,"i":"frame:a5381fd6-bbb4-430b-8cdd-bbda770afd41","isBounded":false,"isDraggable":true,"isResizable":true,"maxH":36,"maxW":36,"minH":2,"minW":2,"moved":false,"resizeHandles":["s","w","e","n","sw","nw","se","ne"],"static":false,"w":4,"x":8,"y":0}]},"layoutFidget":"grid"},"layoutID":"","theme":{"id":"0196ebba-5457-4411-abf8-06f2e660f57a-Profile-theme","name":"0196ebba-5457-4411-abf8-06f2e660f57a-Profile-theme","properties":{"background":"#ffffff","backgroundHTML":"","fidgetBackground":"#ffffff","fidgetBorderColor":"#eeeeee","fidgetBorderWidth":"1px","fidgetShadow":"none","font":"Inter","fontColor":"#000000","headingsFont":"Inter","headingsFontColor":"#000000","musicURL":"https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804"}}}',
  fileName: "Profile",
  fileType: "json",
  isEncrypted: false,
  publicKey: "faec323a261fa9dca6fc9ae33f726bae8781b2a1f65250baf5fc4aace2a2e764",
  signature:
    "67b6a314446ceea11066a0c290337e0e5841de533205dd9a1678574b2df47690d365d958a429ce8e182ddf56ac4ce030b60804a2102ba9098a7987a37f6c4005",
  timestamp: "2024-12-06T12:23:11.653Z",
};
// test
export const AiChatSidebar: React.FC<AiChatSidebarProps> = ({
  onClose,
  onApplySpaceConfig,
  wsUrl = process.env.NEXT_PUBLIC_WS_SERVER_URL || "ws://192.168.8.19:3040",
  spaceContext, // This prop is no longer needed but keeping for compatibility
}) => {
  const { previewConfig, setPreviewConfig, isPreviewMode, setIsPreviewMode } =
    useSidebarContext();
  const currentFid = useCurrentFid();

  // Get current space state directly to avoid function reference issues
  const {
    currentSpaceId,
    currentTabName,
    localSpaces,
    loadSpaceTab,
    loadSpaceTabOrder,
  } = useAppStore((state) => ({
    currentSpaceId: state.currentSpace.currentSpaceId,
    currentTabName: state.currentSpace.currentTabName,
    localSpaces: state.space.localSpaces,
    loadSpaceTab: state.space.loadSpaceTab,
    loadSpaceTabOrder: state.space.loadSpaceTabOrder,
  }));

  // Memoize the actual current space configuration to prevent infinite re-renders
  const actualSpaceContext = useMemo(() => {
    if (!currentSpaceId || !localSpaces[currentSpaceId]) {
      return undefined;
    }

    const tabName = currentTabName ?? "Profile";
    const currentTabConfig = localSpaces[currentSpaceId]?.tabs[tabName];
    return currentTabConfig;
  }, [currentSpaceId, currentTabName, localSpaces]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm going to assist you customizing your space. I can help you:\n\n• Add and configure fidgets\n• Adjust themes and colors\n• Modify layouts and styling\n• Suggest improvements\n\nWhat would you like to customize today?",
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
  const wsServiceRef = useRef<WebSocketService | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize WebSocket service
  const initializeWebSocketService = useCallback(() => {
    if (wsServiceRef.current) {
      wsServiceRef.current.destroy();
    }

    // Log the current space context being sent to WebSocket
    console.log(
      "🔍 AiChatSidebar: Initializing WebSocket with context from store"
    );
    console.log("📋 Store State Debug:", {
      currentSpaceId: currentSpaceId,
      currentTabName: currentTabName,
      hasLocalSpaces: !!localSpaces,
      localSpacesKeys: Object.keys(localSpaces || {}),
      currentSpaceExists: !!(currentSpaceId && localSpaces[currentSpaceId]),
      currentSpaceData: currentSpaceId ? localSpaces[currentSpaceId] : null,
    });
    console.log("📋 Current Space Context:", {
      actualSpaceContext: actualSpaceContext,
      contextType: typeof actualSpaceContext,
      contextKeys: actualSpaceContext ? Object.keys(actualSpaceContext) : null,
      contextSize: actualSpaceContext
        ? JSON.stringify(actualSpaceContext).length
        : 0,
    });
    console.log("👤 User FID:", currentFid);
    console.log("🔗 WebSocket URL:", wsUrl);

    const config = {
      url: wsUrl,
      sessionId,
      maxReconnectAttempts: 5,
      reconnectBackoffMs: 1000,
      spaceContext: actualSpaceContext,
      userFid: currentFid,
    };

    const callbacks = {
      onStatusChange: (status: ConnectionStatus) => {
        setConnectionStatus(status);
        console.log(`🔌 WebSocket status changed to: ${status}`);
      },
      onMessage: (message: any) => {
        handleWebSocketMessage(message);
      },
      onError: (error: string) => {
        toast.error(error);
      },
    };

    wsServiceRef.current = new WebSocketService(config, callbacks);
    wsServiceRef.current.connect();
  }, [wsUrl, sessionId, actualSpaceContext, currentFid]);

  const handleWebSocketMessage = useCallback((wsMessage: any) => {
    console.log("Received WebSocket message:", wsMessage);

    // Handle structured messages with type
    if (wsMessage.type) {
      switch (wsMessage.type) {
        case "ai_response":
          if (wsMessage.data.response) {
            setMessages((prev) => [...prev, wsMessage.data.response!]);
            setIsLoading(false);
            setLoadingType(null);

            // Clear message timeout
            if (messageTimeoutRef.current) {
              clearTimeout(messageTimeoutRef.current);
              messageTimeoutRef.current = null;
            }
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

            // Clear message timeout
            if (messageTimeoutRef.current) {
              clearTimeout(messageTimeoutRef.current);
              messageTimeoutRef.current = null;
            }
          } else if (wsMessage.data.status === "error") {
            setIsLoading(false);
            setLoadingType(null);
            toast.error("AI processing error");

            // Clear message timeout
            if (messageTimeoutRef.current) {
              clearTimeout(messageTimeoutRef.current);
              messageTimeoutRef.current = null;
            }
          }
          break;

        case "pong": {
          // Handle pong response from your friend's server
          console.log("Received pong response!");
          const pongMessage: Message = {
            id: `pong-${Date.now()}`,
            role: "assistant",
            content: "🏓 Pong! WebSocket connection is working perfectly!",
            timestamp: new Date(),
            type: "text",
          };
          setMessages((prev) => [...prev, pongMessage]);
          toast.success("Pong received! WebSocket is working!");
          break;
        }

        case "REPLY": {
          // Handle new server REPLY format
          console.log("Received REPLY message from:", wsMessage.name);

          if (wsMessage.message === "pong") {
            // Handle pong response in new format
            const pongMessage: Message = {
              id: `pong-${Date.now()}`,
              role: "assistant",
              content: `🏓 Pong! ${wsMessage.name} responded: ${wsMessage.message}`,
              timestamp: new Date(),
              type: "text",
            };
            setMessages((prev) => [...prev, pongMessage]);
            toast.success("Pong received! WebSocket is working!");
          } else {
            // Handle other REPLY messages (like AI responses)
            const replyMessage: Message = {
              id: `reply-${Date.now()}`,
              role: "assistant",
              content: `${wsMessage.name}: ${wsMessage.message}`,
              timestamp: new Date(),
              type: "text",
            };
            setMessages((prev) => [...prev, replyMessage]);

            // Clear loading state when receiving AI response
            setIsLoading(false);
            setLoadingType(null);

            // Clear message timeout
            if (messageTimeoutRef.current) {
              clearTimeout(messageTimeoutRef.current);
              messageTimeoutRef.current = null;
            }
          }
          break;
        }

        default:
          console.log("Unknown WebSocket message type:", wsMessage.type);
          break;
      }
    }
    // Handle simple messages with name/message format
    else if (wsMessage.name === "pong" || wsMessage.message === "pong") {
      console.log("Received pong response (simple format)!");
      const pongMessage: Message = {
        id: `pong-${Date.now()}`,
        role: "assistant",
        content: `🏓 Pong! Server responded: ${wsMessage.message || "pong"}`,
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, pongMessage]);
      toast.success("Pong received! WebSocket is working!");
    }
    // Fallback: check if any property contains "pong"
    else if (JSON.stringify(wsMessage).toLowerCase().includes("pong")) {
      console.log("Received pong response (fallback detection)!");
      const pongMessage: Message = {
        id: `pong-${Date.now()}`,
        role: "assistant",
        content: `🏓 Pong detected! Raw response: ${JSON.stringify(wsMessage)}`,
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, pongMessage]);
      toast.success("Pong received!");
    } else {
      console.log("Unhandled message format:", wsMessage);
    }
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    initializeWebSocketService();
    return () => {
      wsServiceRef.current?.destroy();
      // Clear message timeout on unmount
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
    };
  }, [initializeWebSocketService]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Monitor space data changes for debugging
  useEffect(() => {
    console.log("🔄 AiChatSidebar: Space data changed");
    console.log("📊 Space Data Monitor:", {
      currentSpaceId: currentSpaceId,
      currentTabName: currentTabName,
      hasLocalSpaces: !!localSpaces,
      localSpacesCount: Object.keys(localSpaces || {}).length,
      spaceExists: !!(currentSpaceId && localSpaces[currentSpaceId]),
      tabExists: !!(
        currentSpaceId &&
        localSpaces[currentSpaceId]?.tabs[currentTabName || "Profile"]
      ),
      actualSpaceContext: actualSpaceContext,
      contextSize: actualSpaceContext
        ? JSON.stringify(actualSpaceContext).length
        : 0,
      contextHasFidgets: !!actualSpaceContext?.fidgetInstanceDatums,
      contextHasTheme: !!actualSpaceContext?.theme,
      contextHasLayout: !!actualSpaceContext?.layoutDetails,
      fidgetCount: actualSpaceContext?.fidgetInstanceDatums
        ? Object.keys(actualSpaceContext.fidgetInstanceDatums).length
        : 0,
    });

    // Log the actual space structure for debugging
    if (currentSpaceId && localSpaces[currentSpaceId]) {
      const space = localSpaces[currentSpaceId];
      console.log("🏠 Full Space Structure:", {
        spaceId: currentSpaceId,
        spaceTabs: Object.keys(space.tabs || {}),
        spaceMetadata: {
          id: space.id,
          fid: space.fid,
          contractAddress: space.contractAddress,
          network: space.network,
          updatedAt: space.updatedAt,
        },
        currentTab: currentTabName || "Profile",
        currentTabData: space.tabs[currentTabName || "Profile"],
        tabDataKeys: space.tabs[currentTabName || "Profile"]
          ? Object.keys(space.tabs[currentTabName || "Profile"])
          : null,
      });
    } else {
      console.log("❌ No space data found:", {
        currentSpaceId,
        hasLocalSpaces: !!localSpaces,
        localSpacesKeys: Object.keys(localSpaces || {}),
      });
    }
  }, [currentSpaceId, currentTabName, localSpaces, actualSpaceContext]);

  // Monitor space context changes and update WebSocket
  useEffect(() => {
    if (wsServiceRef.current && actualSpaceContext) {
      console.log(
        "🔄 AiChatSidebar: Updating WebSocket with new space context"
      );
      wsServiceRef.current.updateSpaceContext(actualSpaceContext);
    }
  }, [actualSpaceContext]);

  // Monitor when space config is fully loaded with content
  useEffect(() => {
    if (currentSpaceId && localSpaces[currentSpaceId]) {
      const space = localSpaces[currentSpaceId];
      const currentTab = space.tabs[currentTabName || "Profile"];

      if (currentTab) {
        const hasFullConfig =
          !!(
            currentTab.fidgetInstanceDatums &&
            Object.keys(currentTab.fidgetInstanceDatums).length > 0
          ) || !!(currentTab.theme && currentTab.layoutDetails);

        if (hasFullConfig) {
          console.log("✅ FULL SPACE CONFIG LOADED!");
          console.log("📋 Complete space configuration available:", {
            spaceId: currentSpaceId,
            tabName: currentTabName || "Profile",
            fidgetCount: Object.keys(currentTab.fidgetInstanceDatums || {})
              .length,
            hasTheme: !!currentTab.theme,
            hasLayout: !!currentTab.layoutDetails,
            themeId: currentTab.theme?.id,
            layoutFidget: currentTab.layoutDetails?.layoutFidget,
            configSize: JSON.stringify(currentTab).length,
          });

          // Optionally send the full config to WebSocket when it's ready
          if (wsServiceRef.current?.isConnected()) {
            console.log("🚀 Sending full space config to WebSocket");
            wsServiceRef.current.updateSpaceContext(currentTab);
          }
        } else {
          console.log(
            "⏳ Space config partially loaded, waiting for full config...",
            {
              spaceId: currentSpaceId,
              tabName: currentTabName || "Profile",
              hasFidgets: !!currentTab.fidgetInstanceDatums,
              fidgetCount: Object.keys(currentTab.fidgetInstanceDatums || {})
                .length,
              hasTheme: !!currentTab.theme,
              hasLayout: !!currentTab.layoutDetails,
              tabKeys: Object.keys(currentTab),
            }
          );
        }
      } else {
        console.log("⏳ Space exists but tab not loaded yet:", {
          spaceId: currentSpaceId,
          tabName: currentTabName || "Profile",
          availableTabs: Object.keys(space.tabs || {}),
        });
      }
    }
  }, [
    currentSpaceId,
    currentTabName,
    localSpaces,
    wsServiceRef.current?.isConnected(),
  ]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
      type: "text",
    };

    console.log("💬 Sending user message:");
    console.log("  Message:", userMessage.content);
    console.log(
      "  Current Space Context Size:",
      actualSpaceContext ? JSON.stringify(actualSpaceContext).length : 0,
      "chars"
    );
    console.log(
      "  Space Context Preview:",
      actualSpaceContext
        ? JSON.stringify(actualSpaceContext, null, 2).substring(0, 300) + "..."
        : "No context"
    );

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Send message via WebSocket if connected
      if (wsServiceRef.current?.isConnected()) {
        console.log("🔌 WebSocket is connected, sending message...");
        // Set loading type for WebSocket messages (assuming "tom" is thinking)
        setLoadingType("thinking");

        // Note: Space context is automatically updated via useEffect when actualSpaceContext changes
        console.log(
          "� Space context is automatically managed by WebSocket service"
        );

        const success = wsServiceRef.current.sendUserMessage(
          userMessage.content
        );

        if (success) {
          console.log("✅ Message sent successfully via WebSocket");
        } else {
          console.error("❌ Failed to send message via WebSocket");
        }

        // Clear any existing timeout
        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current);
        }

        // Set a timeout to clear loading state if no response received
        messageTimeoutRef.current = setTimeout(() => {
          console.warn(
            "No response received within 30 seconds, clearing loading state"
          );
          setIsLoading(false);
          setLoadingType(null);
          toast.error("No response received from AI. Please try again.");
          messageTimeoutRef.current = null;
        }, 30000); // 30 second timeout
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
          // Builder AI: Use DummyTestConfig for testing
          const builderData = {
            spaceConfig: JSON.parse(DummyTestConfig.fileData),
            reasoning:
              "Applied a professional profile layout with clean theme and optimized feed configuration",
            changesApplied: [
              "Updated theme colors to white/gray scheme",
              "Added profile feed fidget with filtered content",
              "Added Farcaster frame for enhanced functionality",
              "Optimized grid layout for better visual balance",
            ],
          };

          mockResponse = {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content:
              "I've created a professional profile layout with a clean theme and optimized feed configuration. What do you think about this design?",
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

      // Clear preview mode
      setPreviewConfig(null);
      setIsPreviewMode(false);

      toast.success("Space configuration applied successfully!");
    } catch (error) {
      console.error("Failed to apply space config:", error);
      toast.error("Failed to apply configuration. Please try again.");
    }
  };

  const handlePreviewConfig = (message: Message) => {
    if (!message.spaceConfig) return;

    setPreviewConfig(message.spaceConfig);
    setIsPreviewMode(true);
    toast.success(
      "Preview mode activated! Check your space to see the changes."
    );
  };

  const handleCancelPreview = () => {
    setPreviewConfig(null);
    setIsPreviewMode(false);
    toast.info("Preview cancelled. Returned to original configuration.");
  };

  // Simple ping function for WebSocket testing
  const handlePing = () => {
    if (wsServiceRef.current?.isConnected()) {
      const success = wsServiceRef.current.ping();

      if (success) {
        // Add a user message to show the ping in chat
        const userMessage: Message = {
          id: `ping-${Date.now()}`,
          role: "user",
          content: "🏓 Ping sent to server...",
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, userMessage]);

        toast.info("Ping sent! Waiting for pong response...");
      }
    } else {
      toast.error(
        "WebSocket not connected! Please wait for connection or try reconnecting."
      );
    }
  };

  // Send current space context for debugging (now happens automatically)
  const handleSendSpaceContext = () => {
    console.log(
      "🔄 Manual space context send requested (normally sent automatically)"
    );
    console.log("📋 Current actual space context:", actualSpaceContext);

    if (wsServiceRef.current?.isConnected()) {
      // Note: Context is now sent automatically, but this provides manual override
      console.log("ℹ️ Context is normally sent automatically when it changes");
      // Update the WebSocket service with the current context
      wsServiceRef.current.updateSpaceContext(actualSpaceContext);
      const success = wsServiceRef.current.sendSpaceContext();

      if (success) {
        const contextSize = actualSpaceContext
          ? JSON.stringify(actualSpaceContext).length
          : 0;
        const contextSizeKB = Math.round(contextSize / 1024);

        // Add a user message to show the context send in chat
        const userMessage: Message = {
          id: `context-${Date.now()}`,
          role: "user",
          content: `📋 Space context sent to server (${contextSizeKB}KB)...\n\nContext preview: ${
            actualSpaceContext
              ? JSON.stringify(actualSpaceContext, null, 2).substring(0, 200) +
                (JSON.stringify(actualSpaceContext).length > 200 ? "..." : "")
              : "No context available"
          }`,
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, userMessage]);

        toast.info(
          `Space context sent to backend (${contextSizeKB}KB) for debugging!`
        );
      }
    } else {
      toast.error(
        "WebSocket not connected! Please wait for connection or try reconnecting."
      );
    }
  };

  const getMockAiResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();

    // Return configuration when user asks to apply/implement something OR test config
    if (
      input.includes("apply") ||
      input.includes("implement") ||
      input.includes("set up") ||
      input.includes("create space") ||
      input.includes("test") ||
      input.includes("dummy")
    ) {
      return {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content:
          "Perfect! I've prepared a custom space configuration based on our conversation. This will update your theme colors, add the requested fidgets, and optimize your layout.\n\n**Changes included:**\n• Updated color scheme\n• Added social media feed fidget\n• Improved mobile layout\n• Enhanced typography\n\nClick 'Apply Configuration' below to implement these changes.",
        timestamp: new Date(),
        type: "config",
        spaceConfig: JSON.parse(DummyTestConfig.fileData),
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
                {/* Preview Mode Indicator */}
                {isPreviewMode && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                    <Eye className="w-3 h-3" />
                    <span className="text-xs font-medium">Preview Mode</span>
                  </div>
                )}
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
          <div className="flex items-center gap-2">
            {/* Cancel Preview Button */}
            {isPreviewMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelPreview}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel Preview
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>
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
                  <div className="w-10 h-10 relative flex items-center justify-center flex-shrink-0 mt-1">
                    <Image
                      src="/images/tom_alerts.png"
                      alt="AI Avatar"
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
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

                      {/* Preview and Apply buttons */}
                      {!message.configApplied && (
                        <div className="space-y-2">
                          <Button
                            onClick={() => handlePreviewConfig(message)}
                            size="sm"
                            variant="outline"
                            className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview Design
                          </Button>

                          <Button
                            onClick={() => handleApplyConfig(message)}
                            size="sm"
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Apply Configuration
                          </Button>
                        </div>
                      )}

                      {/* Applied state */}
                      {message.configApplied && (
                        <Button
                          disabled
                          size="sm"
                          className="w-full bg-green-500 hover:bg-green-500"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Configuration Applied
                        </Button>
                      )}
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
                <div className="w-10 h-10 relative flex items-center justify-center flex-shrink-0 mt-1">
                  <Image
                    src="/images/tom_alerts.png"
                    alt="AI Avatar"
                    width={40}
                    height={40}
                    className="rounded-full object-cover shadow-md"
                  />
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">
                      {loadingType === "thinking" && "Thinking..."}
                      {loadingType === "building" && "Building..."}
                      {!loadingType && "Tom is thinking..."}
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
                onClick={initializeWebSocketService}
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
          <div className="grid grid-cols-2 gap-2 mb-2">
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
              onClick={() => setInputValue("Apply a modern design to my space")}
              className="text-xs h-8"
            >
              ✨ Apply Design
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePing}
              className="text-xs h-8 bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
            >
              🏓 Ping Test
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Test the dummy config")}
              className="text-xs h-8 bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              🧪 Test Config
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("🔍 DEBUG: Current Store State");
                console.log("Current Space ID:", currentSpaceId);
                console.log("Current Tab Name:", currentTabName);
                console.log("Local Spaces:", localSpaces);
                console.log("Space Keys:", Object.keys(localSpaces || {}));
                if (currentSpaceId && localSpaces[currentSpaceId]) {
                  console.log(
                    "Current Space Full:",
                    localSpaces[currentSpaceId]
                  );
                  console.log(
                    "Available Tabs:",
                    Object.keys(localSpaces[currentSpaceId].tabs || {})
                  );
                  const currentTab =
                    localSpaces[currentSpaceId].tabs[
                      currentTabName || "Profile"
                    ];
                  console.log("Current Tab Config:", currentTab);
                  if (currentTab) {
                    console.log(
                      "Tab Has Fidgets:",
                      !!currentTab.fidgetInstanceDatums
                    );
                    console.log("Tab Has Theme:", !!currentTab.theme);
                    console.log("Tab Has Layout:", !!currentTab.layoutDetails);
                  }
                }
                toast.info("Store state logged to console!");
              }}
              className="text-xs h-8 bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              🔍 Debug Store
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("🔄 Manually triggering space data load...");
                if (currentSpaceId) {
                  console.log(
                    "Loading space tab order and data for:",
                    currentSpaceId
                  );
                  loadSpaceTabOrder(currentSpaceId)
                    .then(() => {
                      console.log("✅ Tab order loaded");
                      return loadSpaceTab(
                        currentSpaceId,
                        currentTabName || "Profile"
                      );
                    })
                    .then(() => {
                      console.log("✅ Space tab data loaded");
                      toast.success("Space data reloaded!");
                    })
                    .catch((error) => {
                      console.error("❌ Error loading space data:", error);
                      toast.error("Failed to load space data");
                    });
                } else {
                  toast.error("No space ID found");
                }
              }}
              className="text-xs h-8 bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
            >
              🔄 Reload Space Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendSpaceContext}
              className="text-xs h-8 bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              📋 Manual Send (
              {actualSpaceContext
                ? `${Math.round(JSON.stringify(actualSpaceContext).length / 1024)}KB`
                : "0KB"}
              )
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInputValue(
                  "Analyze my current space configuration and suggest improvements"
                );
                handleSendMessage();
              }}
              className="text-xs h-8 bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100 col-span-2"
            >
              🧪 Test Message with Context
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AiChatSidebar;
