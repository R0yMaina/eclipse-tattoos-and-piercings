import { useState } from 'react';
import { X, Instagram } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import studio1 from '@/assets/gallery/studio-1.jpg';
import studio2 from '@/assets/gallery/studio-2.jpg';
import studio3 from '@/assets/gallery/studio-3.jpg';

const galleryImages = [
  { src: studio1, alt: 'Eclipse Tattoo Studio - Professional tattoo work' },
  { src: studio2, alt: 'Eclipse Tattoo Studio - Custom piercing setup' },
  { src: studio3, alt: 'Eclipse Tattoo Studio - Premium studio environment' },
];

export const InstagramGallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

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

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group relative cursor-pointer"
              onClick={() => setSelectedImage(index)}
            >
              <div className="relative overflow-hidden rounded-[20px] md:rounded-[28px] transition-all duration-300 hover:scale-[1.02]">
                <OptimizedImage
                  src={image.src}
                  alt={image.alt}
                  aspectRatio="square"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  containerClassName="w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 rounded-[20px] md:rounded-[28px] transition-all duration-300" />

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="glass-panel px-4 md:px-6 py-2 md:py-3 rounded-full">
                    <p className="text-xs md:text-sm font-semibold text-foreground">View Full Size</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage !== null && (
          <div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-smooth"
              aria-label="Close"
            >
              <X className="h-5 w-5 md:h-6 md:w-6 text-foreground" />
            </button>

            <div className="max-w-5xl w-full">
              <img
                src={galleryImages[selectedImage].src}
                alt={galleryImages[selectedImage].alt}
                loading="eager"
                className="w-full h-auto rounded-[20px] md:rounded-[28px] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <p className="text-center text-muted-foreground mt-4 md:mt-6 text-xs md:text-sm">
                {galleryImages[selectedImage].alt}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
