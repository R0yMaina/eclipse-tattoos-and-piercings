import { useEffect, useRef } from 'react';
import { DollarSign, MessageCircle, Info } from 'lucide-react';
import { pricingInfo } from '@/data/pricing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const OverviewCards = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.children;
    gsap.from(cards, {
      y: 30,
      opacity: 0,
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
    <section id="overview" ref={sectionRef} className="py-24 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Overview
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Essential pricing information at a glance.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-3 gap-6">
          <div className="glass-panel-elevated glass-highlight rounded-[24px] p-8 text-center">
            <DollarSign className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-3xl font-heading font-bold text-primary mb-2">
              ${pricingInfo.shop_minimum_usd}
            </h3>
            <p className="text-sm text-muted-foreground">
              Shop Minimum
            </p>
          </div>

          <div className="glass-panel-elevated glass-highlight rounded-[24px] p-8 text-center">
            <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
              Complimentary Consultation
            </h3>
            <p className="text-sm text-muted-foreground">
              Deposit required to book a session
            </p>
          </div>

          <div className="glass-panel-elevated glass-highlight rounded-[24px] p-8 text-center">
            <Info className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
              Final Quote After Consult
            </h3>
            <p className="text-sm text-muted-foreground">
              Based on size, placement & complexity
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground italic max-w-2xl mx-auto">
            {pricingInfo.disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
};
