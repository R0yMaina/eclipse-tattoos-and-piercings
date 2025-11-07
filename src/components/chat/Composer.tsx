import { Send, Square } from 'lucide-react';
import { useState } from 'react';

interface ComposerProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  onStop: () => void;
}

export const Composer = ({ onSend, isLoading, onStop }: ComposerProps) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about services, pricing, or booking..."
        className="flex-1 min-h-[44px] max-h-32 px-4 py-3 rounded-lg glass-panel resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        rows={1}
        disabled={isLoading}
      />
      
      {isLoading ? (
        <button
          type="button"
          onClick={onStop}
          className="flex-shrink-0 h-11 w-11 rounded-lg bg-destructive hover:bg-destructive/90 flex items-center justify-center transition-smooth"
          aria-label="Stop generation"
        >
          <Square className="h-4 w-4 fill-current" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex-shrink-0 h-11 w-11 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-smooth gold-glow"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      )}
    </form>
  );
};