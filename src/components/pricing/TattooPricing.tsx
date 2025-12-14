import { useEffect, useRef } from 'react';
import { tattooServices } from '@/data/services';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const TattooPricing = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;

    const items = listRef.current.children;
    gsap.from(items, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%'
      }
    });
  }, []);

  return (
    <section id="tattoos" ref={sectionRef} className="py-24 px-4 bg-background">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Tattoo Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Prices in Kenyan Shillings (KES). Final quote provided after consultation.
          </p>
        </div>

        <div ref={listRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tattooServices.map((service, index) => (
            <div 
              key={index}
              className="glass-panel rounded-[16px] p-6 hover:bg-primary/5 transition-colors"
            >
              <h3 className="font-semibold text-foreground mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {service.description}
              </p>
              <div className="flex items-center justify-between">
                {service.price_from_kes ? (
                  <span className="text-lg font-bold text-primary">
                    From KES {service.price_from_kes.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground italic">
                    {service.price_note}
                  </span>
                )}
                {service.duration_estimate && (
                  <span className="text-xs text-muted-foreground">
                    {service.duration_estimate}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
