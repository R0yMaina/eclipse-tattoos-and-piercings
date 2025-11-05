import { useEffect, useRef } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  { 
    q: "How do you determine final pricing?", 
    a: "After consultation, based on size, placement, complexity, palette, and artist tier. We provide a clear quote before booking." 
  },
  { 
    q: "Is the consultation free?", 
    a: "Yes. A deposit is required to secure an appointment." 
  },
  { 
    q: "Are touch-ups included?", 
    a: "Eligible work may receive a complimentary touch-up within policy windows. Ask your artist for details." 
  },
  { 
    q: "Is jewelry included with piercings?", 
    a: "Jewelry is priced separately. We carry premium titanium and solid gold options. Sales tax applies to jewelry and retail items." 
  },
  { 
    q: "Can I get a rough estimate online?", 
    a: "Yes—use the estimators above for a range. Final quotes follow consultation." 
  }
];

export const PricingFAQ = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    gsap.from(contentRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%'
      }
    });
  }, []);

  return (
    <section id="faq" ref={sectionRef} className="py-24 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Quick answers to common pricing questions.
          </p>
        </div>

        <div ref={contentRef} className="glass-panel-elevated rounded-[24px] p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
