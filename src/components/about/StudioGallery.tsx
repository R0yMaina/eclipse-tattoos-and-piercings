import { useState } from 'react';
import { X } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import tattoo1 from '@/assets/gallery/tattoo-1.jpg';
import tattoo2 from '@/assets/gallery/tattoo-2.jpg';
import tattoo3 from '@/assets/gallery/tattoo-3.jpg';
import tattoo4 from '@/assets/gallery/tattoo-4.jpg';
import tattoo5 from '@/assets/gallery/tattoo-5.jpg';
import tattoo6 from '@/assets/gallery/tattoo-6.jpg';

const galleryImages = [
  { src: tattoo1, alt: "Intricate spiral tribal tattoo design" },
  { src: tattoo2, alt: "Rose with butterflies tattoo" },
  { src: tattoo3, alt: "Lioness with flowers tattoo" },
  { src: tattoo4, alt: "Koi fish with stars tattoo" },
  { src: tattoo5, alt: "Ankh symbol back tattoo" },
  { src: tattoo6, alt: "Clover and script tattoo" },
];

const videoLinks = [
  { url: "https://vm.tiktok.com/ZMAWpFvph/", title: "Studio Work Showcase" }
];
export const StudioGallery = () => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

  return (
    <>
      <section className="py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold mb-3">
              Inside the Studio
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              A glimpse into our space and our work
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {galleryImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image)}
                className="group relative overflow-hidden rounded-[16px] md:rounded-[20px] border border-border hover:border-primary/40 transition-smooth"
              >
                <OptimizedImage 
                  src={image.src}
                  alt={image.alt}
                  aspectRatio="4/3"
                  className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                  containerClassName="w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
              </button>
            ))}
            
            {videoLinks.map((video, index) => (
              <a
                key={`video-${index}`}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[4/3] overflow-hidden rounded-[16px] md:rounded-[20px] border border-border hover:border-primary/40 transition-smooth flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5"
              >
                <div className="text-center p-4 md:p-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="text-xs md:text-sm font-medium text-foreground">{video.title}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1">View on TikTok</p>
                </div>
              </a>
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
          
          <div className="max-w-6xl max-h-[90vh] relative w-full" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage.src}
              alt={selectedImage.alt}
              loading="eager"
              className="w-full h-full object-contain rounded-[16px] md:rounded-[20px]"
            />
            <p className="text-center text-muted-foreground mt-4 text-xs md:text-sm">
              {selectedImage.alt}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
