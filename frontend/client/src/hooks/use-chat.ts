import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Message } from "@shared/schema";

export function useChat(sessionId: number) {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/chat/sessions', sessionId, 'messages'],
    enabled: !!sessionId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update the messages cache with both user and assistant messages
      queryClient.setQueryData(
        ['/api/chat/sessions', sessionId, 'messages'],
        (oldMessages: Message[] = []) => [
          ...oldMessages,
          data.userMessage,
          data.assistantMessage
        ]
      );
    },
    onError: (error) => {
      console.error('Send message error:', error);
    }
  });

  return {
    messages,
    isLoading,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending
  };
}
