import { Button } from '@/components/ui/button';
import { Phone, Mail } from 'lucide-react';

export const CTAFooter = () => {
  return (
    <section className="py-16">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="glass-panel-elevated glass-highlight rounded-[28px] p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-4">
            Ready to Start?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Reach out today to schedule your consultation. Our team is here to bring your vision to life with precision and artistry.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 gold-glow transition-smooth rounded-full px-8 py-6 text-base font-semibold"
            >
              <a href="tel:+15555550142">
                <Phone className="mr-2 h-5 w-5" />
                +1 (555) 555‑0142
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-primary text-foreground hover:bg-primary/10 rounded-full px-8 py-6 text-base transition-smooth"
            >
              <a href="mailto:bookings@eclipse-ink.com">
                <Mail className="mr-2 h-5 w-5" />
                Email Us
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
