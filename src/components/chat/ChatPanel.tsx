import { X, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Composer } from './Composer';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Citation {
  index: number;
  url: string;
  title: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

interface ChatPanelProps {
  onClose: () => void;
}

export const ChatPanel = ({ onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [clientToken] = useState(() => {
    const stored = localStorage.getItem('chat_client_token');
    if (stored) return stored;
    const newToken = crypto.randomUUID();
    localStorage.setItem('chat_client_token', newToken);
    return newToken;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          message: content,
          sessionId,
          clientToken,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantId = crypto.randomUUID();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                setIsLoading(false);
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;

                if (content) {
                  assistantContent += content;

                  setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage?.role === 'assistant' && lastMessage.id === assistantId) {
                      return [
                        ...prev.slice(0, -1),
                        { ...lastMessage, content: assistantContent },
                      ];
                    }
                    return [
                      ...prev,
                      { id: assistantId, role: 'assistant', content: assistantContent },
                    ];
                  });
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      }
    } catch (error: unknown) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Send error:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-heading text-lg">Eclipse Concierge</h3>
            <p className="text-xs text-muted-foreground">Your AI assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-accent rounded-lg transition-smooth"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <h4 className="font-heading text-lg mb-2">Welcome to Eclipse</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Ask about services, pricing, artists, or booking.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "What's your pricing?",
                "Do you do walk-ins?",
                "Tell me about aftercare",
                "How do deposits work?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="text-xs px-3 py-2 rounded-full border border-border hover:border-primary transition-smooth"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="p-4 border-t border-border">
        <Composer
          onSend={sendMessage}
          isLoading={isLoading}
          onStop={stopGeneration}
        />
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          AI guidance for informational purposes. Consult professionals for health concerns.
        </p>
      </div>
    </div>
  );
};