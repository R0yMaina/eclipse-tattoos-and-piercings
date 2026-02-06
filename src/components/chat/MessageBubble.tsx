import { User, Sparkles } from 'lucide-react';

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

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isAssistant ? 'bg-primary/10' : 'bg-accent'
        }`}>
        {isAssistant ? (
          <Sparkles className="h-4 w-4 text-primary" />
        ) : (
          <User className="h-4 w-4 text-accent-foreground" />
        )}
      </div>

      {/* Message content */}
      <div className={`flex-1 ${isAssistant ? '' : 'text-right'}`}>
        <div className={`inline-block max-w-[85%] rounded-lg px-4 py-2 ${isAssistant
            ? 'glass-panel text-left'
            : 'bg-primary text-primary-foreground'
          }`}>
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Sources:</p>
              <div className="space-y-1">
                {message.citations.map((citation: Citation) => (
                  <a
                    key={citation.index}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-primary hover:underline"
                  >
                    [{citation.index}] {citation.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};