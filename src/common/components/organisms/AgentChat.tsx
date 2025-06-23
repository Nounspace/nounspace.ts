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
  Loader2,
  Settings,
  Check,
  AlertCircle,
  Wifi,
  WifiOff,
  RotateCcw,
  Clock,
} from "lucide-react";
import { CgProfile } from "react-icons/cg";
import { first } from "lodash";
import { toast } from "sonner";
import { useCurrentFid } from "@/common/lib/hooks/useCurrentFid";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { useAppStore } from "@/common/data/stores/app";
import { SpaceCheckpoint } from "@/common/data/stores/app/checkpoints/checkpointStore";
import { SpaceConfig, SpaceConfigSaveDetails } from "@/app/(spaces)/Space";
import Image from "next/image";
import {
  WebSocketService,
  ConnectionStatus,
  type IncomingMessage,
} from "@/common/lib/services/websocket";

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
  spaceConfig?: SpaceConfig; // JSON space configuration from AI
  configApplied?: boolean;
  aiType?: "planner" | "builder"; // Track which AI responded
  builderResponse?: any; // Store the actual builder response data
  checkpointId?: string; // Reference to checkpoint if this message created one
}

interface AiChatSidebarProps {
  onClose: () => void;
  onApplySpaceConfig?: (config: SpaceConfigSaveDetails) => Promise<void>;
  wsUrl?: string; // WebSocket URL for AI communication
  getCurrentSpaceContext?: () => any; // Function to get fresh context
}

export const AiChatSidebar: React.FC<AiChatSidebarProps> = ({
  onClose,
  onApplySpaceConfig,
  wsUrl = AI_CHAT_CONFIG.DEFAULT_WS_URL,
  getCurrentSpaceContext,
}) => {
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

  // Use checkpoint store from app store
  const {
    checkpoints,
    isRestoring,
    createCheckpointFromContext,
    restoreCheckpoint,
    deleteCheckpoint,
    getRecentCheckpoints,
  } = useAppStore((state) => ({
    checkpoints: state.checkpoints.checkpoints,
    isRestoring: state.checkpoints.isRestoring,
    createCheckpointFromContext: state.checkpoints.createCheckpointFromContext,
    restoreCheckpoint: state.checkpoints.restoreCheckpoint,
    deleteCheckpoint: state.checkpoints.deleteCheckpoint,
    getRecentCheckpoints: state.checkpoints.getRecentCheckpoints,
  }));

  // Function to get fresh space context when needed
  const getFreshSpaceContext = useCallback(() => {
    // If external context provider is available, use it (for theme editor)
    if (getCurrentSpaceContext) {
      return getCurrentSpaceContext();
    }

    // Otherwise, get current context from app store
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName();

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
        currentSpaceConfig?.tabs[getCurrentTabName() || "Profile"] || null;
    }

    return currentTabConfig;
  }, [
    getCurrentSpaceContext, 
    getCurrentSpaceId, 
    getCurrentTabName, 
    homebaseConfig, 
    homebaseTabs, 
    getCurrentSpaceConfig
  ]);

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

  // Create a comprehensive checkpoint from current configuration
  const createSpaceCheckpoint = useCallback((
    description?: string, 
    source: SpaceCheckpoint['source'] = 'ai-chat'
  ): SpaceCheckpoint => {
    return createCheckpointFromContext(
      getCurrentSpaceConfig,
      getFreshSpaceContext,
      description,
      source
    );
  }, [createCheckpointFromContext, getCurrentSpaceConfig, getFreshSpaceContext]);

  // Restore to a specific checkpoint using the store
  const handleRestoreCheckpoint = async (checkpoint: SpaceCheckpoint) => {
    if (!onApplySpaceConfig) return;
    
    const success = await restoreCheckpoint(checkpoint.id, onApplySpaceConfig);
    
    if (success) {
      toast.success(`Restored to "${checkpoint.name}"`);
    } else {
      toast.error("Failed to restore checkpoint. Please try again.");
    }
  };

  // Delete a checkpoint using the store
  const handleDeleteCheckpoint = (checkpointId: string) => {
    deleteCheckpoint(checkpointId);
    toast.info("Checkpoint deleted");
  };

  // Get recent checkpoints for display
  const recentCheckpoints = getRecentCheckpoints(3);

  // Initialize WebSocket service
  const initializeWebSocketService = useCallback(() => {
    if (wsServiceRef.current) {
      wsServiceRef.current.destroy();
    }

    console.log("🔧 Initializing WebSocket service");

    const config = {
      url: wsUrl,
      maxReconnectAttempts: AI_CHAT_CONFIG.RECONNECT_ATTEMPTS,
      reconnectBackoffMs: AI_CHAT_CONFIG.RECONNECT_BACKOFF,
      spaceContext: null, // We'll provide fresh context when sending messages
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
  }, [wsUrl, currentFid]);

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
        });

        try {
          // Check if the message contains JSON configuration
          if (messageContent.includes("fidgetInstanceDatums")) {
            spaceConfig = JSON.parse(messageContent);
            console.log("✅ AI generated space config:", spaceConfig);
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
              "🎨 I've created a new space configuration for you! You can apply it below.",
            timestamp: new Date(),
            type: "config",
            spaceConfig: spaceConfig,
            aiType: "builder",
            builderResponse: wsMessage,
          };
          setMessages((prev) => [...prev, aiMessage]);
          setIsLoading(false);
          setLoadingType(null);

          toast.success("🎨 New space configuration created!");
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
        let spaceConfig: SpaceConfig | undefined = undefined;
        const messageContent = wsMessage.message || "Builder is working...";

        try {
          // Check if the message contains JSON configuration
          if (messageContent.includes("fidgetInstanceDatums")) {
            spaceConfig = JSON.parse(messageContent);
            console.log("✅ AI generated space config:", spaceConfig);
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
            ? "🎨 I've created a new space configuration for you! You can apply it below."
            : messageContent,
          timestamp: new Date(),
          type: spaceConfig ? "config" : "text",
          spaceConfig: spaceConfig,
          aiType: "builder",
          builderResponse: spaceConfig ? wsMessage : undefined,
        };

        setMessages((prev) => [...prev, logMessage]);

        // Handle config or loading state
        if (spaceConfig) {
          setIsLoading(false);
          setLoadingType(null);
          toast.success("🎨 New space configuration created!");
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
      // Send message via WebSocket with FRESH context
      if (wsServiceRef.current?.isConnected()) {
        console.log("📤 Sending user message with fresh space config context");
        
        // Get the current context right before sending
        const freshContext = getFreshSpaceContext();
        console.log("🔧 Fresh context for AI:", {
          hasContext: !!freshContext,
          fidgetCount: freshContext?.fidgetInstanceDatums
            ? Object.keys(freshContext.fidgetInstanceDatums).length
            : 0,
          layoutID: freshContext?.layoutID,
          theme: freshContext?.theme?.id,
        });

        // Update the WebSocket service with fresh context
        wsServiceRef.current.updateSpaceContext(freshContext);
        
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

    try {
      // Create checkpoint before applying new configuration
      const checkpoint = createSpaceCheckpoint(`Before applying AI changes`);
      
      console.log("💾 Created checkpoint before applying config:", checkpoint.id);
      console.log("🎨 AI Config structure:", Object.keys(message.spaceConfig));

      // Extract layoutConfig from the AI's layoutDetails structure
      const layoutConfig = message.spaceConfig.layoutDetails?.layoutConfig;
      
      console.log("🎯 Extracted layout config:", layoutConfig);
      console.log("🎯 Layout items count:", layoutConfig?.layout?.length || 0);

      // Convert SpaceConfig to the format expected by saveLocalConfig
      // Note: saveLocalConfig expects layoutConfig directly, not wrapped in layoutDetails
      const saveDetails = {
        theme: message.spaceConfig.theme,
        layoutConfig: layoutConfig, // Direct layoutConfig, not layoutDetails
        fidgetInstanceDatums: message.spaceConfig.fidgetInstanceDatums,
        fidgetTrayContents: message.spaceConfig.fidgetTrayContents,
      };

      await onApplySpaceConfig(saveDetails);

      // Mark config as applied and link to checkpoint
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { 
            ...msg, 
            configApplied: true,
            checkpointId: checkpoint.id 
          } : msg
        )
      );

      console.log("✅ Space configuration applied successfully");
      toast.success("Space configuration applied successfully!");
    } catch (error) {
      console.error("❌ Failed to apply space config:", error);
      console.error("❌ Error details:", error);
      console.error("❌ AI Config that failed:", message.spaceConfig);
      toast.error("Failed to apply configuration. Please try again.");
    }
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
                {/* Checkpoints Indicator */}
                {checkpoints.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs font-medium">{checkpoints.length} checkpoint{checkpoints.length !== 1 ? 's' : ''}</span>
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

        {/* Checkpoints Section */}
        {recentCheckpoints.length > 0 && (
          <div className="px-4 py-2 border-b bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Space Checkpoints</h3>
              <span className="text-xs text-gray-500">{checkpoints.length} saved</span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {recentCheckpoints.map((checkpoint) => (
                <div key={checkpoint.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-700 truncate">
                      {checkpoint.name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <span className={`px-1 py-0.5 rounded text-xs ${{
                        'theme-editor': 'bg-orange-100 text-orange-700',
                        'ai-chat': 'bg-purple-100 text-purple-700',
                        'manual': 'bg-blue-100 text-blue-700'
                      }[checkpoint.source]}`}>
                        {checkpoint.source}
                      </span>
                      {new Date(checkpoint.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestoreCheckpoint(checkpoint)}
                      disabled={isRestoring}
                      className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCheckpoint(checkpoint.id)}
                      className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {checkpoints.length > 3 && (
              <div className="text-xs text-gray-500 mt-1 text-center">
                Showing last 3 checkpoints
              </div>
            )}
          </div>
        )}

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
                                <strong>Message Type:</strong>{" "}
                                {message.builderResponse.type}
                              </div>
                              <div>
                                <strong>Source:</strong>{" "}
                                {message.builderResponse.name}
                              </div>
                              {message.spaceConfig && (
                                <div className="mt-2">
                                  <div className="mb-1">
                                    <strong>Config Generated:</strong> ✅ Space configuration ready
                                  </div>
                                  <details className="mt-2">
                                    <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-800">
                                      View Full Configuration →
                                    </summary>
                                    <div className="mt-2 p-2 bg-white border rounded max-h-40 overflow-y-auto">
                                      <pre className="text-xs whitespace-pre-wrap break-all">
                                        {JSON.stringify(message.spaceConfig, null, 2)}
                                      </pre>
                                    </div>
                                  </details>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Apply button or applied state */}
                      {!message.configApplied ? (
                        <Button
                          onClick={() => handleApplyConfig(message)}
                          size="sm"
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Apply Configuration
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            disabled
                            size="sm"
                            className="w-full bg-green-500 hover:bg-green-500"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Configuration Applied
                          </Button>
                          
                          {/* Show linked checkpoint if exists */}
                          {message.checkpointId && (
                            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                              💾 Checkpoint created before applying this configuration
                            </div>
                          )}
                        </div>
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
                    {new Date(message.timestamp).toLocaleTimeString([], {
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