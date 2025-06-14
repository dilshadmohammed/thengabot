import { useState, useEffect } from "react";
import ChatInterface from "@/components/chat-interface";
import Sidebar from "@/components/sidebar";
import PrivacyNotice from "@/components/privacy-notice";
import { Brain, History, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function ChatPage() {
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true);

  // Create initial chat session
  const { data: sessions, refetch: refetchSessions } = useQuery({
    queryKey: ['/api/chat/sessions'],
  });

  // Create new session on mount if none exists
  useEffect(() => {
    if (sessions && sessions.length > 0 && !currentSessionId) {
      setCurrentSessionId(sessions[0].id);
    } else if (!currentSessionId) {
      createNewSession();
    }
  }, [sessions, currentSessionId]);

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat Session' }),
        credentials: 'include'
      });
      
      if (response.ok) {
        const newSession = await response.json();
        setCurrentSessionId(newSession.id);
        refetchSessions();
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-soft))]">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-full flex items-center justify-center">
                <Brain className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">MindfulBot</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Your AI Mental Health Companion</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={createNewSession}>
                <History className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            {currentSessionId && (
              <ChatInterface sessionId={currentSessionId} />
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar sessionId={currentSessionId} />
          </div>
        </div>
      </main>

      {/* Privacy Notice */}
      {showPrivacyNotice && (
        <PrivacyNotice onClose={() => setShowPrivacyNotice(false)} />
      )}
    </div>
  );
}
