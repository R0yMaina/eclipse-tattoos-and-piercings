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
    <section id="aftercare" ref={sectionRef} className="py-24 px-4 bg-background/30">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Aftercare Essentials
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Proper healing is essential for preserving the longevity and beauty of your body art.
          </p>
        </div>

        <div ref={contentRef} className="grid md:grid-cols-2 gap-8">
          {/* Tattoo Aftercare Section */}
          <div className="glass-panel-elevated glass-highlight rounded-[24px] p-8">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-heading font-semibold">Tattoo Care</h3>
            </div>

            <div className="space-y-6">
              <ul className="space-y-4">
                {aftercareInfo.tattoo.map((step, index) => (
                  <li key={index} className="text-base text-muted-foreground flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Piercing Aftercare Section */}
          <div className="glass-panel-elevated glass-highlight rounded-[24px] p-8">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-heading font-semibold">Piercing Care</h3>
            </div>

            <div className="space-y-6">
              <ul className="space-y-4">
                {aftercareInfo.piercing.map((step, index) => (
                  <li key={index} className="text-base text-muted-foreground flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-primary/40 hover:border-primary hover:bg-primary/10 transition-smooth group"
          >
            <Download className="w-5 h-5 mr-3 group-hover:translate-y-0.5 transition-transform" />
            Download Full Aftercare Guide
          </Button>
        </div>
      </div>
    </section>
  );
};
