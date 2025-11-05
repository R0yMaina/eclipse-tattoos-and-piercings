import { useEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import { piercingFees } from '@/data/pricing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const PiercingFees = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;

    const items = listRef.current.children;
    gsap.from(items, {
      x: -20,
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
    <section id="piercings" ref={sectionRef} className="py-24 px-4 bg-background/50">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Piercing Fees
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Service fees per piercing. Jewelry priced separately.
          </p>
        </div>

        <div className="glass-panel-elevated rounded-[20px] p-6 mb-8 max-w-3xl mx-auto">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">18+</strong> for most piercings. Select piercings available for{' '}
                <strong className="text-foreground">16+</strong> with parent/guardian and valid ID. Service fees listed below—jewelry is priced separately based on material and design.
              </p>
            </div>
          </div>
        </div>

        <div ref={listRef} className="max-w-3xl mx-auto space-y-3">
          {piercingFees.map((fee, index) => (
            <div 
              key={index}
              className="glass-panel rounded-[16px] p-4 flex items-center justify-between hover:bg-primary/5 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  {fee.area}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {fee.notes}
                </p>
              </div>
              <div className="text-right ml-4">
                <span className="text-lg font-semibold text-primary">
                  ${fee.fee_from}+
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 glass-panel-elevated rounded-[20px] p-6 max-w-3xl mx-auto border-2 border-primary/20">
          <h4 className="font-heading font-semibold text-lg mb-2 text-foreground">
            Curated Ear Session
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Personalized ear mapping and jewelry selection to fit your anatomy.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">From</span>
            <span className="text-2xl font-bold text-primary">$120</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 italic">
            Plan & consultation; piercings and jewelry priced separately.
          </p>
        </div>
      </div>
    </section>
  );
};
