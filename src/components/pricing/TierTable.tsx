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
            Artist Tiers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparent rates by experience level and session type.
          </p>
        </div>

        <div ref={tableRef} className="space-y-6">
          {artistTiers.map((tier, index) => (
            <div 
              key={index}
              className="tier-row glass-panel-elevated glass-highlight rounded-[20px] p-6 md:p-8 hover:scale-[1.01] transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-heading font-semibold text-primary">
                      {tier.tier}
                    </h3>
                    {tier.tier === 'Senior' && (
                      <Badge variant="outline" className="border-primary/40 text-primary">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tier.notes}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 md:gap-6">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Hourly</p>
                    <p className="text-lg font-semibold text-foreground">
                      ${tier.hourly_usd[0]}–${tier.hourly_usd[1]}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Half Day</p>
                    <p className="text-lg font-semibold text-foreground">
                      ${tier.half_day_usd[0]}–${tier.half_day_usd[1]}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Full Day</p>
                    <p className="text-lg font-semibold text-foreground">
                      ${tier.day_session_usd[0]}–${tier.day_session_usd[1]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
