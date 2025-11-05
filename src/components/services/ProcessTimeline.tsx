import { useEffect, useRef } from 'react';
import { MessageCircle, Palette, Zap, Heart } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { 
    title: "1. Consultation", 
    copy: "Discuss your idea, placement, sizing, timeline, and budget—online or in-studio.",
    icon: MessageCircle
  },
  { 
    title: "2. Design", 
    copy: "Your artist refines a custom design or selects flash aligned to your vision.",
    icon: Palette
  },
  { 
    title: "3. Session", 
    copy: "Comfort-driven pacing, precise execution, and museum-grade hygiene.",
    icon: Zap
  },
  { 
    title: "4. Aftercare", 
    copy: "Clear instructions and follow-ups for a clean, beautiful heal.",
    icon: Heart
  }
];

export const ProcessTimeline = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lineRef.current || !stepsRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%'
      }
    });

    tl.from(lineRef.current, {
      scaleX: 0,
      duration: 1.2,
      ease: 'power3.out'
    })
    .from(stepsRef.current.children, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out'
    }, '-=0.8');
  }, []);

  return (
    <section id="process" ref={sectionRef} className="py-24 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From concept to completion—a refined process designed around you.
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div 
            ref={lineRef}
            className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 hidden md:block"
            style={{ transformOrigin: 'left center' }}
          />

          {/* Steps */}
          <div ref={stepsRef} className="grid md:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Node */}
                  <div className="flex justify-center mb-6">
                    <div className="glass-panel-elevated w-16 h-16 rounded-full flex items-center justify-center gold-glow">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-lg font-heading font-semibold mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.copy}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
