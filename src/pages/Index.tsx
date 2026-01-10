import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { lazy, Suspense } from "react";

const Scene3D = lazy(() => import("@/components/home/Scene3D"));

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-background overflow-hidden">
      {/* 3D Background */}
      <Suspense fallback={<div className="absolute inset-0 bg-background" />}>
        <Scene3D />
      </Suspense>

      {/* Content overlay */}
      <div className="relative z-10 text-center space-y-4 md:space-y-6 max-w-2xl mx-auto w-full px-4 py-8 md:py-0">
        {/* Logo */}
        <div className="mb-4 md:mb-8">
          <svg viewBox="0 0 200 200" className="w-20 h-20 md:w-32 md:h-32 mx-auto mb-4 md:mb-6 opacity-50">
            <defs>
              <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 0.6 }} />
              </linearGradient>
            </defs>
            <image 
              href="../limit.png"
              x="0"
              y="0"
              width="200"
              height="200"
              clipPath="url(#circle-clip)"
              preserveAspectRatio="xMidYMid slice"
            />
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
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-2 md:mb-4 leading-tight [text-shadow:_0_2px_12px_rgba(0,0,0,0.8),_0_4px_24px_rgba(0,0,0,0.6)]">
          Eclipse Tattoo & Piercings
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 font-light [text-shadow:_0_2px_8px_rgba(0,0,0,0.7)]">
          Perfection is the aim 
        </p>
        
        <div className="flex flex-col gap-3 md:gap-4 w-full max-w-md mx-auto sm:max-w-none sm:flex-row sm:justify-center">
          <Button 
            onClick={() => navigate('/contact')}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gold-glow transition-smooth rounded-full px-6 md:px-8 py-5 md:py-6 text-sm md:text-base font-semibold w-full sm:w-auto backdrop-blur-sm"
          >
            Book Your Session
          </Button>
          <Button 
            onClick={() => navigate('/services')}
            variant="outline"
            size="lg"
            className="border-primary text-foreground hover:bg-primary/10 rounded-full px-6 md:px-8 py-5 md:py-6 text-sm md:text-base transition-smooth w-full sm:w-auto backdrop-blur-sm bg-background/20"
          >
            View Services
          </Button>
          <Button 
            onClick={() => navigate('/about')}
            variant="outline"
            size="lg"
            className="border-primary text-foreground hover:bg-primary/10 rounded-full px-6 md:px-8 py-5 md:py-6 text-sm md:text-base transition-smooth w-full sm:w-auto backdrop-blur-sm bg-background/20"
          >
            Learn Our Story
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
