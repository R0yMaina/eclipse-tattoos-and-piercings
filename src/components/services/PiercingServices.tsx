import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, Info } from 'lucide-react';
import { piercingServices } from '@/data/services';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const PiercingServices = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.children;
    gsap.from(cards, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%'
      }
    });
  }, []);

  return (
    <section id="piercings" ref={sectionRef} className="py-24 px-4 bg-background/50">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Piercing Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aseptic technique, premium jewelry, and precise placement.
          </p>
        </div>

        <div className="glass-panel-elevated rounded-[20px] p-6 mb-8 max-w-3xl mx-auto">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                <strong className="text-foreground">18+</strong> for most piercings. Select piercings available for <strong className="text-foreground">16+</strong> with parent/guardian and valid ID.
              </p>
              <p>
                Service fees listed below. <strong className="text-foreground">Jewelry priced separately</strong> based on metal and design.
              </p>
            </div>
          </div>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {piercingServices.map((service, index) => (
            <div 
              key={index}
              className="glass-panel-elevated glass-highlight rounded-[20px] p-6 hover:scale-[1.01] transition-all duration-300"
            >
              <h3 className="text-xl font-heading font-semibold mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                {service.description}
              </p>

              <div className="space-y-2 mb-4">
                {service.price_from_kes && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground">From KES {service.price_from_kes.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {service.notes && (
                <p className="text-xs text-muted-foreground mb-4 italic">
                  {service.notes}
                </p>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full border-primary/40 hover:border-primary hover:bg-primary/10 transition-smooth"
              >
                Book Now
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
