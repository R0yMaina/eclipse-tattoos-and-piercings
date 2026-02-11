import { Instagram } from 'lucide-react';

export const InstagramGallery = () => {
  return (
    <section className="py-12 md:py-16 overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-4">
            <Instagram className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold">
              Our Work
            </h2>
          </div>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-4 md:mb-6 px-4">
            Follow us on Instagram for the latest work and studio updates
          </p>
          <a
            href="https://www.instagram.com/eclipse__tattoos?igsh=MTRxOXM2Nzk4dmhjZg=="
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-smooth font-semibold text-sm md:text-base"
          >
            <Instagram className="h-4 w-4 md:h-5 md:w-5" />
            @eclipse__tattoos
          </a>
        </div>
      </div>
    </section>
  );
};
