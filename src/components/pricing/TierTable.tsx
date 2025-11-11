import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { artistTiers } from '@/data/pricing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const TierTable = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tableRef.current) return;

    const rows = tableRef.current.querySelectorAll('.tier-row');
    gsap.from(rows, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%'
      }
    });
  }, []);

  return (
    <section id="tiers" ref={sectionRef} className="py-24 px-4 bg-background/50">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Tattoo Styles & Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pricing based on tattoo type, size, and complexity. Book a consultation for an accurate quote.
          </p>
        </div>

        <div ref={tableRef} className="space-y-6">
          {artistTiers.map((tier, index) => (
            <div 
              key={index}
              className="tier-row glass-panel-elevated glass-highlight rounded-[20px] p-6 md:p-8 hover:scale-[1.01] transition-all duration-300"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-heading font-semibold text-primary">
                    {tier.tier}
                  </h3>
                  {tier.tier === 'Color Realism' && (
                    <Badge variant="outline" className="border-primary/40 text-primary">
                      Popular
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {tier.notes}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Pricing:</span>
                  <span className="text-sm font-semibold text-primary">
                    {tier.price_description}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 glass-panel-elevated rounded-[20px] p-6 text-sm text-muted-foreground">
          <p className="leading-relaxed">
            All tattoo pricing is determined during your free consultation. We'll discuss your vision, provide recommendations, and give you an accurate quote based on your specific design.
          </p>
        </div>
      </div>
    </section>
  );
};
