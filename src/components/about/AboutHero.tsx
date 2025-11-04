import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import SplitType from 'split-type';
import { Button } from '@/components/ui/button';
import { Users, Calendar } from 'lucide-react';

export const AboutHero = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const eclipseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set([headingRef.current, subheadingRef.current, buttonsRef.current], { opacity: 1 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from(eclipseRef.current, {
      scale: 0.8,
      opacity: 0,
      duration: 1,
    }, 0);

    if (headingRef.current) {
      const split = new SplitType(headingRef.current, { types: 'words,chars' });
      
      tl.from(split.chars, {
        y: 40,
        opacity: 0,
        stagger: 0.03,
        duration: 0.8,
      }, 0.2);
    }

    tl.from(subheadingRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.8,
    }, 0.5);

    tl.from(buttonsRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.6,
    }, 0.7);

    return () => {
      tl.kill();
    };
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div 
        ref={eclipseRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] pointer-events-none opacity-20"
      >
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <defs>
            <linearGradient id="about-eclipse-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 0.4 }} />
            </linearGradient>
          </defs>
          <circle 
            cx="250" 
            cy="250" 
            r="200" 
            fill="none" 
            stroke="url(#about-eclipse-gradient)" 
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="container relative z-10 max-w-5xl mx-auto px-4">
        <div className="text-center space-y-6">
          <h1 
            ref={headingRef}
            className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-foreground"
          >
            Beyond Ink—Our Story
          </h1>
          
          <p 
            ref={subheadingRef}
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Luxury studio experience, museum‑grade craft, and a culture built on consent, cleanliness, and care.
          </p>

          <div 
            ref={buttonsRef}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            <Button 
              onClick={() => scrollToSection('artists')}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gold-glow transition-smooth rounded-full px-8 py-6 text-base font-semibold"
            >
              <Users className="mr-2 h-5 w-5" />
              Meet the Artists
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/contact'}
              className="border-primary text-foreground hover:bg-primary/10 rounded-full px-8 py-6 text-base transition-smooth"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book a Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
