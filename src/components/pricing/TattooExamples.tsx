import { useEffect, useRef } from 'react';
import { Clock, DollarSign } from 'lucide-react';
import { tattooExamples } from '@/data/pricing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const TattooExamples = () => {
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
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%'
      }
    });
  }, []);

  return (
    <section id="tattoos" ref={sectionRef} className="py-24 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Tattoo Rates & Examples
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Estimated ranges for common pieces. Final pricing depends on design complexity and artist tier.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {tattooExamples.map((example, index) => (
            <div 
              key={index}
              className="glass-panel-elevated glass-highlight rounded-[20px] p-6 hover:scale-[1.02] transition-all duration-300"
            >
              <h3 className="text-xl font-heading font-semibold mb-4">
                {example.name}
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm">Time</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {example.estimated_hours[0]}–{example.estimated_hours[1]}h
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="text-sm">Price</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    ${example.estimated_usd[0]}–${example.estimated_usd[1]}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground italic">
                {example.notes}
              </p>
            </div>
          ))}
        </div>

        <div className="glass-panel-elevated rounded-[20px] p-6 max-w-3xl mx-auto border-2 border-primary/20">
          <p className="text-sm text-muted-foreground text-center">
            <strong className="text-foreground">Cover-ups:</strong> Quoted after consultation. 
            Complexity can increase session time and pricing.
          </p>
        </div>
      </div>
    </section>
  );
};
