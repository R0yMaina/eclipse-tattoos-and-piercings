import { useState } from 'react';
import { X, Instagram } from 'lucide-react';
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
    <section className="py-16 overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Instagram className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-heading font-semibold">
              Our Work
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Follow us on Instagram for the latest work and studio updates
          </p>
          <a
            href="https://www.instagram.com/eclipse__tattoos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-smooth font-semibold"
          >
            <Instagram className="h-5 w-5" />
            @eclipse__tattoos
          </a>
        </div>

        {/* 3D Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group relative cursor-pointer"
              onClick={() => setSelectedImage(index)}
              style={{
                perspective: '1000px',
              }}
            >
              <div
                className="relative overflow-hidden rounded-[28px] transition-all duration-500 ease-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'rotateY(0deg) rotateX(0deg)',
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  const rotateX = ((y - centerY) / centerY) * -10;
                  const rotateY = ((x - centerX) / centerX) * 10;
                  e.currentTarget.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.05)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
                }}
              >
                <div className="aspect-square relative">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 rounded-[28px] transition-all duration-300" />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="glass-panel px-6 py-3 rounded-full">
                    <p className="text-sm font-semibold text-foreground">View Full Size</p>
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
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-smooth"
              aria-label="Close"
            >
              <X className="h-6 w-6 text-foreground" />
            </button>

            <div className="max-w-5xl w-full">
              <img
                src={galleryImages[selectedImage].src}
                alt={galleryImages[selectedImage].alt}
                className="w-full h-auto rounded-[28px] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <p className="text-center text-muted-foreground mt-6 text-sm">
                {galleryImages[selectedImage].alt}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
