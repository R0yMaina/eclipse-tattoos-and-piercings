import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    q: 'Do you accept walk‑ins?',
    a: 'Yes, subject to artist availability. Appointments are recommended for custom work to ensure dedicated time with your preferred artist and proper planning for your piece.'
  },
  {
    q: 'What should I bring to my appointment?',
    a: 'Please bring a valid ID, reference images if you have them, and any notes on placement and sizing. We also recommend wearing comfortable clothing that provides easy access to the area being tattooed or pierced.'
  },
  {
    q: 'How do deposits work?',
    a: 'A non‑refundable deposit secures your booking and goes toward your final session cost. The deposit amount varies based on the size and complexity of your piece. This ensures both your commitment and our artists\' dedicated time for your project.'
  },
  {
    q: 'What is your cancellation policy?',
    a: 'We require at least 48 hours notice for cancellations or rescheduling. Late cancellations or no-shows will forfeit the deposit. We understand emergencies happen—please contact us as soon as possible.'
  },
  {
    q: 'Do you offer touch-ups?',
    a: 'Yes, one complimentary touch-up is included within 6 months of your original session. Additional touch-ups or work done after this period will be charged at our standard rates.'
  }
];

export const FAQ = () => {
  return (
    <section className="py-16">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know before your visit
          </p>
        </div>

        <div className="glass-panel glass-highlight rounded-[28px] p-8">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-b border-border/50 last:border-0"
              >
                <AccordionTrigger className="text-left font-heading font-semibold hover:text-primary transition-smooth py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
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
