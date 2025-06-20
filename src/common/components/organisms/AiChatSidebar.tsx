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
} from "lucide-react";
import { CgProfile } from "react-icons/cg";
import { first } from "lodash";
import { toast } from "sonner";
import { useSidebarContext } from "./Sidebar";
import {
  WebSocketService,
  ConnectionStatus,
  type IncomingMessage,
} from "@/common/services/websocket";
import { useCurrentFid } from "@/common/lib/hooks/useCurrentFid";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { useAppStore } from "@/common/data/stores/app";
import Image from "next/image";

// Configuration constants
const AI_CHAT_CONFIG = {
  DEFAULT_WS_URL: process.env.NEXT_PUBLIC_AI_WS_URL || "ws://localhost:3040",
  WELCOME_MESSAGE: `Hello! I'm here to help you customize your space. I can assist you with:

• Adding and configuring fidgets
• Adjusting themes and colors  
• Modifying layouts and styling
• Suggesting improvements

What would you like to customize today?`,
  SESSION_ID_PREFIX: "ai_session",
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_BACKOFF: 1000,
} as const;

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
}

export const AiChatSidebar: React.FC<AiChatSidebarProps> = ({
  onClose,
  onApplySpaceConfig,
  wsUrl = AI_CHAT_CONFIG.DEFAULT_WS_URL,
}) => {
  const { previewConfig, setPreviewConfig, isPreviewMode, setIsPreviewMode } =
    useSidebarContext();
  const currentFid = useCurrentFid();

  // Load user data for profile picture
  const { data } = useLoadFarcasterUser(currentFid || 0);
  const user = useMemo(() => first(data?.users), [data]);
  const username = useMemo(() => user?.username, [user]);

  const CurrentUserImage = useCallback(
    () =>
      user && user.pfp_url ? (
        <img
          className="w-8 h-8 rounded-full object-cover"
          src={user.pfp_url}
          alt={username || "User"}
        />
      ) : (
        <CgProfile className="w-5 h-5 text-white" />
      ),
    [user, username]
  );

  // Get current space configuration from app store
  const {
    getCurrentSpaceConfig,
    getCurrentSpaceId,
    getCurrentTabName,
    // Homebase-specific stores
    homebaseConfig,
    homebaseTabs,
  } = useAppStore((state) => ({
    getCurrentSpaceConfig: state.currentSpace.getCurrentSpaceConfig,
    getCurrentSpaceId: state.currentSpace.getCurrentSpaceId,
    getCurrentTabName: state.currentSpace.getCurrentTabName,
    homebaseConfig: state.homebase.homebaseConfig,
    homebaseTabs: state.homebase.tabs,
  }));

  // Get current space configuration for AI context
  const currentSpaceId = getCurrentSpaceId();
  const currentTabName = getCurrentTabName();

  // Handle homebase vs regular space configuration
  let currentTabConfig: any = null;
  let currentSpaceConfig: any = null;

  if (currentSpaceId === "homebase") {
    // For homebase, get tab-specific config or main feed config
    if (
      currentTabName &&
      currentTabName !== "Feed" &&
      homebaseTabs[currentTabName]?.config
    ) {
      currentTabConfig = homebaseTabs[currentTabName].config;
      currentSpaceConfig = { tabs: { [currentTabName]: currentTabConfig } };
    } else {
      // Main homebase feed config
      currentTabConfig = homebaseConfig;
      currentSpaceConfig = homebaseConfig
        ? { tabs: { Feed: homebaseConfig } }
        : null;
    }
  } else {
    // Regular space configuration
    currentSpaceConfig = getCurrentSpaceConfig();
    currentTabConfig =
      currentSpaceConfig?.tabs[currentTabName || "Profile"] || null;
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: AI_CHAT_CONFIG.WELCOME_MESSAGE,
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wsServiceRef = useRef<WebSocketService | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize WebSocket service
  const initializeWebSocketService = useCallback(() => {
    if (wsServiceRef.current) {
      wsServiceRef.current.destroy();
    }

    console.log("🔧 Initializing WebSocket service with space context:", {
      hasSpaceContext: !!currentTabConfig,
      spaceContextType: currentTabConfig
        ? typeof currentTabConfig
        : "undefined",
      currentSpaceId,
      currentTabName,
      hasCurrentSpaceConfig: !!currentSpaceConfig,
      tabsInSpaceConfig: currentSpaceConfig
        ? Object.keys(currentSpaceConfig.tabs)
        : [],
      currentTabConfigRaw: currentTabConfig,
      fidgetCount: currentTabConfig?.fidgetInstanceDatums
        ? Object.keys(currentTabConfig.fidgetInstanceDatums).length
        : 0,
      layoutID: currentTabConfig?.layoutID,
      theme: currentTabConfig?.theme?.id,
    });

    const config = {
      url: wsUrl,
      maxReconnectAttempts: AI_CHAT_CONFIG.RECONNECT_ATTEMPTS,
      reconnectBackoffMs: AI_CHAT_CONFIG.RECONNECT_BACKOFF,
      spaceContext: currentTabConfig,
      userFid: currentFid,
    };

    const callbacks = {
      onStatusChange: (status: ConnectionStatus) => {
        setConnectionStatus(status);
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
  }, [wsUrl, currentTabConfig, currentFid]);

  const handleWebSocketMessage = useCallback((wsMessage: IncomingMessage) => {
    // Handle messages according to backend protocol: {type, name, message}
    switch (wsMessage.type) {
      case "pong": {
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
        // Try to parse the message as JSON configuration
        let spaceConfig = null;
        const messageContent = wsMessage.message || "AI response received";

        console.log("📥 Raw REPLY message:", {
          type: wsMessage.type,
          name: wsMessage.name,
          messageLength: messageContent.length,
          messagePreview: messageContent.substring(0, 200) + "...",
          containsFidgetData: messageContent.includes("fidgetInstanceDatums"),
          fullMessage: messageContent,
        });

        try {
          // Check if the message contains JSON configuration
          if (messageContent.includes("fidgetInstanceDatums")) {
            spaceConfig = JSON.parse(messageContent);
            console.log("✅ AI generated space config:", spaceConfig);

            // Log detailed config analysis
            console.log("🔍 REPLY Config Analysis:", {
              hasConfig: !!spaceConfig,
              configType: typeof spaceConfig,
              configKeys: spaceConfig ? Object.keys(spaceConfig) : [],
              hasFidgetInstanceDatums: !!(spaceConfig as any)
                ?.fidgetInstanceDatums,
              fidgetCount: (spaceConfig as any)?.fidgetInstanceDatums
                ? Object.keys((spaceConfig as any).fidgetInstanceDatums).length
                : 0,
              fidgetIds: (spaceConfig as any)?.fidgetInstanceDatums
                ? Object.keys((spaceConfig as any).fidgetInstanceDatums)
                : [],
              hasTheme: !!(spaceConfig as any)?.theme,
              hasLayoutID: !!(spaceConfig as any)?.layoutID,
              fullConfig: JSON.stringify(spaceConfig, null, 2),
            });
          }
        } catch (error) {
          console.error("❌ Failed to parse REPLY message as JSON:", error);
          // Silently handle non-JSON messages
        }

        if (spaceConfig) {
          const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content:
              "🎨 I've created a new space configuration for you! Check the preview below.",
            timestamp: new Date(),
            type: "config",
            spaceConfig: spaceConfig,
            aiType: "builder",
            builderResponse: wsMessage,
          };
          setMessages((prev) => [...prev, aiMessage]);

          // Auto-preview the configuration
          console.log("🔄 Setting preview config from REPLY:", spaceConfig);
          console.log("🎯 IMMEDIATE PREVIEW ACTIVATION (REPLY):", {
            beforePreviewMode: isPreviewMode,
            configBeingSet: {
              fidgetCount: Object.keys(
                (spaceConfig as any).fidgetInstanceDatums || {}
              ).length,
              fidgetIds: Object.keys(
                (spaceConfig as any).fidgetInstanceDatums || {}
              ),
              hasTheme: !!(spaceConfig as any)?.theme,
              themeId: (spaceConfig as any)?.theme?.id,
            },
          });

          setPreviewConfig(spaceConfig);
          setIsPreviewMode(true);
          setIsLoading(false);
          setLoadingType(null);

          // Force a state update to ensure preview is visible
          setTimeout(() => {
            console.log("🔄 Preview mode should now be active (REPLY):", {
              isPreviewModeNow: true,
              previewConfigSet: !!spaceConfig,
            });
          }, 100);

          toast.success(
            "🎨 New space configuration created! Preview is now active."
          );
        } else {
          // Regular text response
          const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: messageContent,
            timestamp: new Date(),
            type: "text",
            aiType: "builder",
          };
          setMessages((prev) => [...prev, aiMessage]);
          setIsLoading(false);
          setLoadingType(null);
        }
        break;
      }

      case "PLANNER_LOGS": {
        const logMessage: Message = {
          id: `planner-log-${Date.now()}`,
          role: "assistant",
          content: wsMessage.message || "Planner is processing...",
          timestamp: new Date(),
          type: "text",
          aiType: "planner",
        };
        setMessages((prev) => [...prev, logMessage]);
        setLoadingType("thinking");
        setIsLoading(true);
        break;
      }

      case "BUILDER_LOGS": {
        // Try to parse the message as JSON configuration
        let spaceConfig = null;
        const messageContent = wsMessage.message || "Builder is working...";

        console.log("📥 Raw BUILDER_LOGS message:", {
          type: wsMessage.type,
          name: wsMessage.name,
          messageLength: messageContent.length,
          messagePreview: messageContent.substring(0, 200) + "...",
          containsFidgetData: messageContent.includes("fidgetInstanceDatums"),
          fullMessage: messageContent,
        });

        try {
          // Check if the message contains JSON configuration
          if (messageContent.includes("fidgetInstanceDatums")) {
            spaceConfig = JSON.parse(messageContent);
            console.log("✅ AI generated space config:", spaceConfig);

            // Log detailed config analysis
            console.log("🔍 BUILDER_LOGS Config Analysis:", {
              hasConfig: !!spaceConfig,
              configType: typeof spaceConfig,
              configKeys: spaceConfig ? Object.keys(spaceConfig) : [],
              hasFidgetInstanceDatums: !!(spaceConfig as any)
                ?.fidgetInstanceDatums,
              fidgetCount: (spaceConfig as any)?.fidgetInstanceDatums
                ? Object.keys((spaceConfig as any).fidgetInstanceDatums).length
                : 0,
              fidgetIds: (spaceConfig as any)?.fidgetInstanceDatums
                ? Object.keys((spaceConfig as any).fidgetInstanceDatums)
                : [],
              hasTheme: !!(spaceConfig as any)?.theme,
              hasLayoutID: !!(spaceConfig as any)?.layoutID,
              fullConfig: JSON.stringify(spaceConfig, null, 2),
            });
          }
        } catch (error) {
          console.error(
            "❌ Failed to parse BUILDER_LOGS message as JSON:",
            error
          );
          // Silently handle non-JSON messages
        }

        const logMessage: Message = {
          id: `builder-log-${Date.now()}`,
          role: "assistant",
          content: spaceConfig
            ? "🎨 I've created a new space configuration for you! Check the preview below."
            : messageContent,
          timestamp: new Date(),
          type: spaceConfig ? "config" : "text",
          spaceConfig: spaceConfig,
          aiType: "builder",
          builderResponse: spaceConfig ? wsMessage : undefined,
        };

        console.log("📝 Creating message with config:", {
          messageId: logMessage.id,
          hasSpaceConfig: !!logMessage.spaceConfig,
          messageType: logMessage.type,
          contentPreview: logMessage.content.substring(0, 100),
          finalConfigPreview: logMessage.spaceConfig
            ? {
                fidgetCount: Object.keys(
                  (logMessage.spaceConfig as any).fidgetInstanceDatums || {}
                ).length,
                fidgetIds: Object.keys(
                  (logMessage.spaceConfig as any).fidgetInstanceDatums || {}
                ),
                hasTheme: !!(logMessage.spaceConfig as any)?.theme,
                themeId: (logMessage.spaceConfig as any)?.theme?.id,
              }
            : null,
        });

        setMessages((prev) => [...prev, logMessage]);

        // Auto-preview the configuration if we have one
        if (spaceConfig) {
          console.log(
            "🔄 Setting preview config from BUILDER_LOGS:",
            spaceConfig
          );
          console.log("🎯 IMMEDIATE PREVIEW ACTIVATION:", {
            beforePreviewMode: isPreviewMode,
            configBeingSet: {
              fidgetCount: Object.keys(
                (spaceConfig as any).fidgetInstanceDatums || {}
              ).length,
              fidgetIds: Object.keys(
                (spaceConfig as any).fidgetInstanceDatums || {}
              ),
              hasTheme: !!(spaceConfig as any)?.theme,
              themeId: (spaceConfig as any)?.theme?.id,
            },
          });

          // Set preview immediately
          setPreviewConfig(spaceConfig);
          setIsPreviewMode(true);
          setIsLoading(false);
          setLoadingType(null);


          toast.success(
            "🎨 New space configuration created! Preview is now active."
          );
        } else {
          setLoadingType("building");
          setIsLoading(true);
        }
        break;
      }

      case "COMM_LOGS": {
        const logMessage: Message = {
          id: `comm-log-${Date.now()}`,
          role: "assistant",
          content: wsMessage.message || "Communication update...",
          timestamp: new Date(),
          type: "text",
          aiType: "planner",
        };
        setMessages((prev) => [...prev, logMessage]);
        break;
      }

      default:
        console.log(
          "❓ Unknown WebSocket message type:",
          wsMessage.type,
          wsMessage
        );
        break;
    }
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    initializeWebSocketService();
    return () => {
      wsServiceRef.current?.destroy();
    };
  }, [initializeWebSocketService]);

  // Update space context when it changes
  useEffect(() => {
    if (wsServiceRef.current) {
      console.log("🔄 Updating WebSocket service with new space context:", {
        hasSpaceContext: !!currentTabConfig,
        fidgetCount: currentTabConfig?.fidgetInstanceDatums
          ? Object.keys(currentTabConfig.fidgetInstanceDatums).length
          : 0,
        layoutID: currentTabConfig?.layoutID,
        theme: currentTabConfig?.theme?.id,
      });
      wsServiceRef.current.updateSpaceContext(currentTabConfig);
    }
  }, [currentTabConfig]);

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
      // Send message via WebSocket
      if (wsServiceRef.current?.isConnected()) {
        console.log(
          "📤 Sending user message with current space config context"
        );
        const success = wsServiceRef.current.sendUserMessage(
          userMessage.content
        );
        if (!success) {
          throw new Error("Failed to send WebSocket message");
        }
      } else {
        throw new Error("WebSocket not connected");
      }
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      toast.error(
        "Failed to send message. Please check your connection and try again."
      );
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  const handleApplyConfig = async (message: Message) => {
    if (!message.spaceConfig || !onApplySpaceConfig) return;

    console.log("🔍 Apply Config Analysis:", {
      messageId: message.id,
      hasSpaceConfig: !!message.spaceConfig,
      configType: typeof message.spaceConfig,
      configKeys: message.spaceConfig ? Object.keys(message.spaceConfig) : [],
      hasFidgetInstanceDatums: !!(message.spaceConfig as any)
        ?.fidgetInstanceDatums,
      fidgetCount: (message.spaceConfig as any)?.fidgetInstanceDatums
        ? Object.keys((message.spaceConfig as any).fidgetInstanceDatums).length
        : 0,
      fidgetIds: (message.spaceConfig as any)?.fidgetInstanceDatums
        ? Object.keys((message.spaceConfig as any).fidgetInstanceDatums)
        : [],
      hasTheme: !!(message.spaceConfig as any)?.theme,
      hasLayoutID: !!(message.spaceConfig as any)?.layoutID,
      fullConfig: JSON.stringify(message.spaceConfig, null, 2),
    });

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

      console.log("✅ Space configuration applied successfully");
      toast.success("Space configuration applied successfully!");
    } catch (error) {
      console.error("❌ Failed to apply space config:", error);
      toast.error("Failed to apply configuration. Please try again.");
    }
  };

  const handlePreviewConfig = (message: Message) => {
    if (!message.spaceConfig) return;

    console.log("🔍 Preview Config Analysis:", {
      messageId: message.id,
      hasSpaceConfig: !!message.spaceConfig,
      configType: typeof message.spaceConfig,
      configKeys: message.spaceConfig ? Object.keys(message.spaceConfig) : [],
      hasFidgetInstanceDatums: !!(message.spaceConfig as any)
        ?.fidgetInstanceDatums,
      fidgetCount: (message.spaceConfig as any)?.fidgetInstanceDatums
        ? Object.keys((message.spaceConfig as any).fidgetInstanceDatums).length
        : 0,
      fidgetIds: (message.spaceConfig as any)?.fidgetInstanceDatums
        ? Object.keys((message.spaceConfig as any).fidgetInstanceDatums)
        : [],
      hasTheme: !!(message.spaceConfig as any)?.theme,
      hasLayoutID: !!(message.spaceConfig as any)?.layoutID,
      fullConfig: JSON.stringify(message.spaceConfig, null, 2),
    });

    setPreviewConfig(message.spaceConfig);
    setIsPreviewMode(true);
    toast.success(
      "Preview mode activated! Check your space to see the changes."
    );
  };

  // const handleCancelPreview = () => {
  //   console.log("🔄 Canceling preview mode");
  //   setPreviewConfig(null);
  //   setIsPreviewMode(false);
  //   toast.info("Preview cancelled. Returned to original configuration.");
  // };

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
      <div className="flex-1 w-[420px] h-full max-h-screen pt-4 flex-col flex overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <LucideSparkle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Vibe Customization</h2>
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
            {/* {isPreviewMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelPreview}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel Preview
              </Button>
            )} */}
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
        <ScrollArea className="flex-1 px-3 py-2">
          <div className="space-y-4 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 relative flex items-center justify-center flex-shrink-0 mt-1">
                    <Image
                      src="/images/tom_alerts.png"
                      alt="AI Avatar"
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  </div>
                )}

                <div
                  className={`flex-1 min-w-0 rounded-lg px-3 py-2 break-words overflow-wrap-anywhere ${
                    message.role === "user"
                      ? "bg-blue-500 text-white ml-auto max-w-[85%]"
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

                  <div className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere word-break hyphens-auto">
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
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                      user && user.pfp_url ? "" : "bg-blue-500"
                    }`}
                  >
                    <CurrentUserImage />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 relative flex items-center justify-center flex-shrink-0 mt-1">
                  <Image
                    src="/images/tom_alerts.png"
                    alt="AI Avatar"
                    width={32}
                    height={32}
                    className="rounded-full object-cover shadow-md"
                  />
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
                onClick={initializeWebSocketService}
                className="text-xs h-7 w-full"
              >
                <Wifi className="w-3 h-3 mr-1" />
                Reconnect to AI
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AiChatSidebar;
