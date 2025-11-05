import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';

export const ServicesCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="glass-panel-elevated glass-highlight rounded-[28px] p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-4">
            Ready when you are.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Tell us your idea—our team will guide you to the best path forward.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/contact')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gold-glow transition-smooth rounded-full px-8 py-6 text-base font-semibold"
            >
              <Mail className="mr-2 h-5 w-5" />
              Start Your Booking
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-primary text-foreground hover:bg-primary/10 rounded-full px-8 py-6 text-base transition-smooth"
            >
              <a href="tel:+15555550142">
                <Phone className="mr-2 h-5 w-5" />
                Talk to an Artist
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
