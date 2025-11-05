import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Sparkles, ShieldCheck } from 'lucide-react';
import { jewelryOptions, aftercareInfo } from '@/data/services';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const JewelryAftercare = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const children = contentRef.current.children;
    gsap.from(children, {
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
    <section id="jewelry-aftercare" ref={sectionRef} className="py-24 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Jewelry & Aftercare
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hypoallergenic metals, ethically sourced stones, and clear aftercare.
          </p>
        </div>

        <div ref={contentRef} className="grid lg:grid-cols-2 gap-8">
          {/* Jewelry Section */}
          <div className="glass-panel-elevated glass-highlight rounded-[24px] p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-heading font-semibold">Premium Jewelry</h3>
            </div>

            <div className="space-y-6">
              {jewelryOptions.map((option, index) => (
                <div key={index} className="border-b border-border/30 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-foreground">{option.title}</h4>
                    <span className="text-sm font-semibold text-primary">From ${option.price_from_usd}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{option.notes}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-6 italic">
              All jewelry is implant-grade and suitable for fresh piercings. Custom orders available.
            </p>
          </div>

          {/* Aftercare Section */}
          <div className="glass-panel-elevated glass-highlight rounded-[24px] p-8">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-heading font-semibold">Aftercare Essentials</h3>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Tattoo Care</h4>
                <ul className="space-y-2">
                  {aftercareInfo.tattoo.map((step, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">Piercing Care</h4>
                <ul className="space-y-2">
                  {aftercareInfo.piercing.map((step, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-6 border-primary/40 hover:border-primary hover:bg-primary/10 transition-smooth"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Full Guide
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
