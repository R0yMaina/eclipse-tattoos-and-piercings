import { Button } from '@/components/ui/button';
import { Calendar, Users } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className="py-16">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="glass-panel-elevated glass-highlight rounded-[28px] p-12 text-center relative overflow-hidden">
          {/* Background accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-10 pointer-events-none">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <circle 
                cx="200" 
                cy="200" 
                r="150" 
                fill="none" 
                stroke="hsl(var(--primary))" 
                strokeWidth="2"
              />
            </svg>
          </div>

          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-4xl font-heading font-semibold">
              Ready when you are.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Consult with an artist or plan your next piece today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => window.location.href = '/contact'}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gold-glow transition-smooth rounded-full px-8 py-6 text-base font-semibold"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Start Your Booking
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('artists')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-primary text-foreground hover:bg-primary/10 rounded-full px-8 py-6 text-base transition-smooth"
              >
                <Users className="mr-2 h-5 w-5" />
                View Artists
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
