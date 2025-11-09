import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { ChatPanel } from './ChatPanel';

export const ChatLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating launcher button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-primary/90 backdrop-blur-xl shadow-2xl flex items-center justify-center transition-smooth hover:scale-105 hover:shadow-primary/50"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:inset-auto md:bottom-24 md:right-6 md:h-[600px] md:w-[420px] md:max-w-[calc(100vw-3rem)]">
          <ChatPanel onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
};