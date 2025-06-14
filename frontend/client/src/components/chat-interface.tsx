import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/hooks/use-chat";
import { Bot, User, Send, Loader2 } from "lucide-react";
import type { Message } from "@shared/schema";

interface ChatInterfaceProps {
  sessionId: number;
}

export default function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    messages,
    isLoading: messagesLoading,
    sendMessage,
    isSending
  } = useChat(sessionId);

  const quickResponses = [
    "I'm feeling anxious",
    "I can't sleep",
    "I feel overwhelmed",
    "I need motivation"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    const messageContent = message.trim();
    setMessage("");
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await sendMessage(messageContent);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickResponse = (response: string) => {
    setMessage(response);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  if (messagesLoading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col shadow-sm border border-gray-100 dark:border-gray-800">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-[hsl(var(--primary)/0.05)] to-[hsl(var(--secondary)/0.05)] rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-full flex items-center justify-center">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">MindfulBot Assistant</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[hsl(var(--success))] rounded-full"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Online & Ready to Help</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 chat-scroll">
        {messages.length === 0 && (
          <div className="flex items-start space-x-3 animate-fade-in">
            <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-white" size={16} />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
              <p className="text-gray-800 dark:text-gray-200">
                Hello! I'm here to support you on your mental health journey. How are you feeling today? 💙
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 animate-fade-in ${
              msg.role === 'user' ? 'justify-end' : ''
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white" size={16} />
              </div>
            )}
            
            <div className={`rounded-2xl px-4 py-3 max-w-md ${
              msg.role === 'user' 
                ? 'bg-[hsl(var(--primary))] text-white rounded-tr-sm' 
                : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.sentimentScore && (
                <div className="mt-2 flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    Mood: {msg.sentimentScore}/5
                  </Badge>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-[hsl(var(--accent))] rounded-full flex items-center justify-center flex-shrink-0">
                <User className="text-white" size={16} />
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-white" size={16} />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextAreaChange}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              className="resize-none min-h-[48px] max-h-[120px]"
              disabled={isSending}
            />
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || isSending}
            className="px-4 py-3"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-2">
          {quickResponses.map((response) => (
            <Button
              key={response}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleQuickResponse(response)}
              disabled={isSending}
            >
              {response}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
