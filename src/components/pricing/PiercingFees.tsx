import { useEffect, useRef } from 'react';
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
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Piercing Prices
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            All prices in Kenyan Shillings (KES). Jewelry included.
          </p>
        </div>

        <div ref={listRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {piercingFees.map((fee, index) => (
            <div 
              key={index}
              className="glass-panel rounded-[16px] p-4 text-center hover:bg-primary/5 transition-colors"
            >
              <h3 className="font-semibold text-foreground mb-1 text-sm">
                {fee.area}
              </h3>
              <span className="text-lg font-bold text-primary">
                KES {fee.price_kes.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
