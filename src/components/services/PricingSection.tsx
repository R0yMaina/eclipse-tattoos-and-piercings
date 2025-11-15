import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Info } from 'lucide-react';
import { packages, pricingInfo } from '@/data/pricing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const PricingSection = () => {
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
    <section id="pricing" ref={sectionRef} className="py-24 px-4 bg-background/50">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Pricing & Packages
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparent pricing with flexible options for your session.
          </p>
        </div>

        {/* Rate Information */}
        <div className="glass-panel-elevated rounded-[20px] p-8 mb-12 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                Tattoo Rates
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-foreground">Hourly Rate</span>
                  <span className="font-semibold text-primary">
                    ${pricingInfo.tattoo_hourly_usd_range[0]}–KES{pricingInfo.tattoo_hourly_usd_range[1]}/hr
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Shop Minimum</span>
                  <span className="font-semibold text-primary">${pricingInfo.shop_minimum_usd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Day Session</span>
                  <span className="font-semibold text-primary">
                    ${pricingInfo.day_session_usd_range[0]}–${pricingInfo.day_session_usd_range[1]}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                Piercing Rates
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-foreground">Service Fee</span>
                  <span className="font-semibold text-primary">
                    ${pricingInfo.piercing_service_fee_usd[0]}–${pricingInfo.piercing_service_fee_usd[1]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Jewelry</span>
                  <span className="font-semibold text-primary">
                    ${pricingInfo.jewelry_price_usd[0]}–${pricingInfo.jewelry_price_usd[1]}+
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Packages */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-6 mb-12">
          {packages.map((pkg, index) => (
            <div 
              key={index}
              className={`glass-panel-elevated glass-highlight rounded-[24px] p-8 relative ${
                pkg.popular ? 'ring-2 ring-primary/30' : ''
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Popular
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
                  ${pkg.price_from_usd}
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

        {/* Deposit Policy */}
        <div className="glass-panel-elevated rounded-[20px] p-8 max-w-4xl mx-auto border-2 border-primary/20">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Deposit Policy</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {pricingInfo.deposit_policy}
              </p>
              <p className="text-xs text-muted-foreground italic">
                {pricingInfo.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
