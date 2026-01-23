import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { lazy, Suspense } from "react";

const Scene3D = lazy(() => import("@/components/home/Scene3D"));

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-background overflow-hidden">
      {/* 3D Background */}
      <Suspense fallback={<div className="absolute inset-0 bg-background" />}>
        <Scene3D />
      </Suspense>

      {/* Content overlay */}
      <div className="relative z-10 text-center space-y-4 md:space-y-6 max-w-2xl mx-auto w-full px-4 py-8 md:py-0">
        {/* Logo */}
        <div className="mb-4 md:mb-8">
          <img
            src="/eclipselogo.png"
            alt="Eclipse Tattoo & Piercings Logo"
            className="w-24 h-24 md:w-40 md:h-40 mx-auto mb-4 md:mb-6 object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-2 md:mb-4 leading-tight [text-shadow:_0_2px_4px_rgba(0,0,0,0.9),_0_4px_16px_rgba(0,0,0,0.8),_0_8px_32px_rgba(0,0,0,0.6)]">
          Eclipse Tattoo & Piercings
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 md:mb-8 font-light [text-shadow:_0_2px_4px_rgba(0,0,0,0.9),_0_4px_12px_rgba(0,0,0,0.7)]">
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
