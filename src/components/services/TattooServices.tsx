import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign } from 'lucide-react';
import { tattooServices } from '@/data/services';
import { OptimizedImage } from '@/components/ui/optimized-image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const TattooServices = () => {
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
    <section id="tattoos" ref={sectionRef} className="py-16 md:py-24 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold mb-4">
            Tattoo Services
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Tailored designs and precise execution—built to age beautifully.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {tattooServices.map((service, index) => (
            <div 
              key={index}
              className="glass-panel-elevated glass-highlight rounded-[20px] overflow-hidden hover:scale-[1.01] transition-all duration-300 flex flex-col"
            >
              {/* Image Section */}
              {service.image && (
                <div className="relative aspect-square overflow-hidden">
                  <OptimizedImage
                    src={service.image}
                    alt={`${service.title} tattoo example`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                </div>
              )}

              {/* Content Section */}
              <div className="p-5 md:p-6 flex flex-col flex-1">
                <h3 className="text-lg md:text-xl font-heading font-semibold mb-2">
                  {service.title}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {service.description}
                </p>

                <div className="space-y-2 mb-4 mt-auto">
                  {service.duration_estimate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{service.duration_estimate}</span>
                    </div>
                  )}
                  {service.price_from_usd && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-semibold text-foreground">From ${service.price_from_usd}</span>
                    </div>
                  )}
                  {service.price_note && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{service.price_note}</span>
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};