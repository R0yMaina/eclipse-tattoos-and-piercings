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
    q: "How do you price tattoos?", 
    a: "Work is priced by piece or hourly depending on size and complexity. Final quotes follow a consultation." 
  },
  { 
    q: "Do you accept walk-ins?", 
    a: "Yes, based on artist availability. Appointments are recommended for custom work." 
  },
  { 
    q: "What should I bring?", 
    a: "Valid ID, reference images, and any notes on style, placement, and sizing." 
  },
  { 
    q: "Is jewelry included with piercings?", 
    a: "Jewelry is priced separately; we carry premium titanium and solid gold options." 
  },
  { 
    q: "Do you do cover-ups?", 
    a: "Yes. We evaluate the existing piece and propose a custom cover-up strategy." 
  },
  { 
    q: "Do you offer touch-ups?", 
    a: "Touch-ups may be complimentary within studio policy windows for eligible pieces." 
  }
];

export const ServicesFAQ = () => {
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
    <section id="faq" ref={sectionRef} className="py-24 px-4 bg-background/50">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Quick answers to common questions about our services.
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
