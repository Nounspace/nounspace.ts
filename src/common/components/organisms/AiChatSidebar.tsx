"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/common/components/atoms/button";
import { Textarea } from "@/common/components/atoms/textarea";
import { ScrollArea } from "@/common/components/atoms/scroll-area";
import { LucideSparkle, Send, User, Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AiChatSidebarProps {
  onClose: () => void;
}

export const AiChatSidebar: React.FC<AiChatSidebarProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI assistant for customizing your space. I can help you:\n\n• Add and configure fidgets\n• Adjust themes and colors\n• Modify layouts and styling\n• Suggest improvements\n\nWhat would you like to customize today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Placeholder for AI API call
      // In the future, this will send the user's message to an AI service
      // and receive a JSON response with customization instructions

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock AI response
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: getMockAiResponse(userMessage.content),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("AI API Error:", error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getMockAiResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes("theme") || input.includes("color")) {
      return "I can help you customize your theme! Here are some suggestions:\n\n• **Background Colors**: Try gradient backgrounds or solid colors that match your brand\n• **Fidget Themes**: Set consistent colors across all your fidgets\n• **Typography**: Choose fonts that reflect your style\n\nWould you like me to suggest specific color schemes or help you configure a particular theme setting?";
    }

    if (input.includes("fidget") || input.includes("widget")) {
      return "Great choice! I can help you add and configure fidgets. Here are some popular options:\n\n• **Feed Fidget**: Display your social media feeds\n• **Text Fidget**: Add custom text and links\n• **Gallery Fidget**: Showcase images or NFTs\n• **Market Data**: Display crypto or stock prices\n\nWhich type of fidget interests you most? I can walk you through the setup process.";
    }

    if (
      input.includes("layout") ||
      input.includes("arrange") ||
      input.includes("organize")
    ) {
      return "I'll help you optimize your layout! Consider these tips:\n\n• **Grid Organization**: Group related fidgets together\n• **Visual Balance**: Mix different sized fidgets for interest\n• **Priority Placement**: Put your most important content in the top-left area\n• **Mobile View**: Ensure your layout works well on mobile devices\n\nWhat specific layout challenge are you facing?";
    }

    return "I understand you'd like help with customization. I can assist with:\n\n• **Themes & Styling**: Colors, fonts, backgrounds\n• **Fidget Management**: Adding, configuring, and arranging fidgets\n• **Layout Optimization**: Making your space look professional\n• **Best Practices**: Tips for engaging content\n\nCould you be more specific about what you'd like to work on? For example, 'help me choose a color scheme' or 'add a social media feed'.";
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
              <p className="text-xs text-gray-500">
                Your space design assistant
              </p>
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
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
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
                      AI is thinking...
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
              onClick={() => setInputValue("Optimize my layout for mobile")}
              className="text-xs h-8"
            >
              📐 Fix Layout
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
