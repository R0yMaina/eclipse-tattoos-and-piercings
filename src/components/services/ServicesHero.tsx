import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import SplitType from 'split-type';

export const ServicesHero = () => {
  const navigate = useNavigate();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headingRef.current || !subheadingRef.current || !ctaRef.current) return;

    const split = new SplitType(headingRef.current, { types: 'words,chars' });
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from(split.chars, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.03
    })
      .from(subheadingRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8
      }, '-=0.4')
      .from(ctaRef.current.children, {
        scale: 0.96,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1
      }, '-=0.4');

    return () => {
      split.revert();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center px-4 py-24 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="150" stroke="url(#gold-gradient)" strokeWidth="2" />
          <defs>
            <linearGradient id="gold-gradient" x1="50" y1="50" x2="350" y2="350">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#C9A44C" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="container max-w-4xl mx-auto text-center relative z-10">
        <h1
          ref={headingRef}
          className="text-5xl md:text-7xl font-heading font-semibold mb-6 text-foreground"
        >
          Tattoos. Piercings. Jewelry.
        </h1>

        <p
          ref={subheadingRef}
          className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-light"
        >
          Custom tattoos and precision piercings delivered with museum-grade hygiene and a luxury studio experience.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/contact')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gold-glow transition-smooth rounded-full px-8 py-6 text-base font-semibold"
          >
            Start Your Booking
          </Button>
        </div>
      </div>
    </section>
  );
};
