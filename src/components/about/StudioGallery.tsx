import { useState } from 'react';
import { X } from 'lucide-react';
import studio1 from '@/assets/gallery/studio-1.jpg';
import studio2 from '@/assets/gallery/studio-2.jpg';
import studio3 from '@/assets/gallery/studio-3.jpg';

const galleryImages = [
  { src: studio1, alt: "Luxury lobby with gold accents and comfortable seating" },
  { src: studio2, alt: "Private tattoo bay with pristine professional setup" },
  { src: studio3, alt: "Sterilization area with medical-grade equipment" },
];

export const StudioGallery = () => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

  return (
    <>
      <section className="py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-3">
              Inside the Studio
            </h2>
            <p className="text-muted-foreground">
              A glimpse into our space and our work
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image)}
                className="group relative aspect-[4/3] overflow-hidden rounded-[20px] border border-border hover:border-primary/40 transition-smooth"
              >
                <img 
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-smooth z-10"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
          
          <div className="max-w-6xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full h-full object-contain rounded-[20px]"
            />
            <p className="text-center text-muted-foreground mt-4 text-sm">
              {selectedImage.alt}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
