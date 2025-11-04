import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto mb-6 opacity-50">
            <defs>
              <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 0.6 }} />
              </linearGradient>
            </defs>
            <circle 
              cx="100" 
              cy="100" 
              r="80" 
              fill="none" 
              stroke="url(#logo-gradient)" 
              strokeWidth="3"
            />
          </svg>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground mb-4">
          Eclipse Tattoo & Piercings
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-light">
          Precision. Permanence. Presence.
        </p>
        
        <Button 
          onClick={() => navigate('/contact')}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 gold-glow transition-smooth rounded-full px-8 py-6 text-base font-semibold"
        >
          Book Your Session
        </Button>
      </div>
    </div>
  );
};

export default Index;
