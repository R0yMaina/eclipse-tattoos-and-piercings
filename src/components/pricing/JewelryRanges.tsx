import { useEffect, useRef } from 'react';
import { Sparkles, Info } from 'lucide-react';
import { jewelryRanges } from '@/data/pricing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const JewelryRanges = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    gsap.from(contentRef.current.children, {
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
    <section id="jewelry" ref={sectionRef} className="py-24 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Jewelry & Materials
          </h2>
          <p className="text-lg text-muted-foreground">
            Premium metals and ethically sourced stones.
          </p>
        </div>

        <div ref={contentRef} className="space-y-6">
          <div className="glass-panel-elevated glass-highlight rounded-[24px] p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-heading font-semibold">Premium Materials</h3>
            </div>

            <div className="space-y-4">
              {jewelryRanges.map((range, index) => (
                <div key={index} className="border-b border-border/30 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-foreground">{range.material}</h4>
                    <span className="text-sm font-semibold text-primary whitespace-nowrap ml-4">
                      From KES {range.price_from_kes.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{range.notes}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel-elevated rounded-[20px] p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">Aftercare & Retail</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Tattoo aftercare kit</span>
                    <span className="font-semibold text-foreground">KES 4,550</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Piercing saline spray</span>
                    <span className="font-semibold text-foreground">KES 1,560</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 italic">
                  Sales tax applies to jewelry and retail items.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
