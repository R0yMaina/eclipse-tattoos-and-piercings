import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { packages } from '@/data/pricing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const PackagesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.children;
    gsap.from(cards, {
      y: 30,
      opacity: 0,
      scale: 0.98,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%'
      }
    });
  }, []);

  return (
    <section id="packages" ref={sectionRef} className="py-24 px-4 bg-background/50">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Packages
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Smart bundles for multiple pieces or curated sessions.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg, index) => (
            <div 
              key={index}
              className={`glass-panel-elevated glass-highlight rounded-[24px] p-8 relative hover:scale-[1.02] transition-all duration-300 KES{
                pkg.popular ? 'ring-2 ring-primary/30' : ''
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}

              <h3 className="text-2xl font-heading font-semibold mb-2">
                {pkg.title}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {pkg.description}
              </p>

              <div className="mb-6">
                <span className="text-3xl font-bold text-primary">
                  KES{pkg.price_from_usd}
                </span>
                <span className="text-sm text-muted-foreground ml-1">from</span>
              </div>

              <p className="text-xs text-muted-foreground mb-6 italic">
                {pkg.notes}
              </p>

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gold-glow transition-smooth"
              >
                Book Package
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
