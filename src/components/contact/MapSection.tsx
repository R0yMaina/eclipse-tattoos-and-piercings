import { MapPin } from 'lucide-react';

export const MapSection = () => {
  return (
    <section className="py-16">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="glass-panel glass-highlight rounded-[28px] overflow-hidden">
          {/* Map Placeholder - Replace with actual map integration */}
          <div className="relative h-[400px] md:h-[500px] bg-secondary/50 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
            
            <div className="relative z-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto gold-glow">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-heading text-xl font-semibold mb-2">
                  Eclipse Tattoo & Piercings
                </p>
                <p className="text-muted-foreground mb-4">
                  123 Eclipse Boulevard, Studio District<br />
                  Los Angeles, CA 90028
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-accent transition-smooth font-medium"
                >
                  <MapPin className="h-4 w-4" />
                  Open in Maps
                </a>
              </div>
            </div>

            {/* Grid pattern overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />
          </div>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-4">
          Map integration available with Mapbox token configuration
        </p>
      </div>
    </section>
  );
};
