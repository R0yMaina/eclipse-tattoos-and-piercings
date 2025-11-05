import { useEffect, useRef } from 'react';
import { ShieldCheck, Clock, AlertCircle, Star } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const PoliciesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.children;
    gsap.from(cards, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%'
      }
    });
  }, []);

  return (
    <section id="policies" ref={sectionRef} className="py-24 px-4 bg-background/50">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Deposits & Policies
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Clear policies to protect your time and ours.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="glass-panel-elevated glass-highlight rounded-[20px] p-6 border-2 border-primary/20">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-heading font-semibold text-lg mb-2 text-foreground">
                  Deposit Policy
                </h3>
                <p className="text-sm text-muted-foreground">
                  A non-refundable deposit (typically 20%, minimum $50) secures your appointment and is applied to the final cost. 
                  Rescheduling requires 48 hours' notice to retain the deposit.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel-elevated rounded-[20px] p-6">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-heading font-semibold text-lg mb-2 text-foreground">
                  Late Cancellations
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cancellations within 48 hours or no-shows forfeit the deposit. We respect your time and ask you to respect ours.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel-elevated rounded-[20px] p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-heading font-semibold text-lg mb-2 text-foreground">
                  Age & Health Requirements
                </h3>
                <p className="text-sm text-muted-foreground">
                  18+ for tattoos; select piercings 16+ with parent/guardian and valid ID. 
                  Disclose medical conditions or allergies before booking. Government-issued photo ID required.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel-elevated rounded-[20px] p-6">
            <div className="flex items-start gap-3">
              <Star className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-heading font-semibold text-lg mb-2 text-foreground">
                  Touch-up Guarantee
                </h3>
                <p className="text-sm text-muted-foreground">
                  Eligible work may receive a complimentary touch-up within studio policy windows. 
                  Ask your artist for details during your session.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 glass-panel-elevated rounded-[20px] p-6 max-w-3xl mx-auto">
          <h4 className="font-semibold text-foreground mb-3">Discounts</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Weekday (Mon–Thu) service fee discounts may apply; excludes jewelry.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Student/Military ID may qualify for select discounts. Ask in studio.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
