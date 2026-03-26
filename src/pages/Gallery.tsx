import { lazy, Suspense, useState } from 'react';
import { X } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Button } from '@/components/ui/button';

// Gallery images
import tattoo1 from '@/assets/gallery/tattoo-1.jpg';
import tattoo2 from '@/assets/gallery/tattoo-2.jpg';
import tattoo3 from '@/assets/gallery/tattoo-3.jpg';
import tattoo4 from '@/assets/gallery/tattoo-4.jpg';
import tattoo5 from '@/assets/gallery/tattoo-5.jpg';
import tattoo6 from '@/assets/gallery/tattoo-6.jpg';
import tattoo7 from '@/assets/gallery/tattoo-7.jpg';
import tattoo8 from '@/assets/gallery/tattoo-8.jpg';
import tattoo9 from '@/assets/gallery/tattoo-9.jpg';
import tattoo10 from '@/assets/gallery/tattoo-10.jpg';
import tattoo11 from '@/assets/gallery/tattoo-11.jpg';
import tattoo12 from '@/assets/gallery/tattoo-12.jpg';
import tattoo13 from '@/assets/gallery/tattoo-13.jpg';
import tattoo14 from '@/assets/gallery/tattoo-14.jpg';
import tattoo15 from '@/assets/gallery/tattoo-15.jpg';
import tattoo16 from '@/assets/gallery/tattoo-16.jpg';

const Scene3DBroad = lazy(() => import('@/components/home/Scene3DBroad'));

type TattooStyle = 'all' | 'tribal' | 'floral' | 'realism' | 'symbolic' | 'script' | 'piercing';

interface GalleryItem {
  src: string;
  alt: string;
  style: TattooStyle[];
}

const galleryItems: GalleryItem[] = [
  { src: tattoo1, alt: "Intricate spiral tribal tattoo design", style: ['tribal', 'symbolic'] },
  { src: tattoo2, alt: "Rose with butterflies tattoo", style: ['floral', 'realism'] },
  { src: tattoo3, alt: "Lioness with flowers tattoo", style: ['realism', 'floral'] },
  { src: tattoo4, alt: "Koi fish with stars tattoo", style: ['realism', 'symbolic'] },
  { src: tattoo5, alt: "Ankh symbol back tattoo", style: ['symbolic', 'tribal'] },
  { src: tattoo6, alt: "Clover and script tattoo", style: ['script', 'symbolic'] },
  { src: tattoo7, alt: "Butterfly with face and 'Born to Die' script", style: ['symbolic', 'script'] },
  { src: tattoo8, alt: "Minimalist fairy silhouette", style: ['symbolic'] },
  { src: tattoo9, alt: "Butterfly with laurel wreath and 'BALANCE'", style: ['symbolic', 'script'] },
  { src: tattoo10, alt: "Elegant floral line art on hip", style: ['floral'] },
  { src: tattoo11, alt: "Surreal geometric design with hands and faces", style: ['realism', 'symbolic'] },
  { src: tattoo12, alt: "Butterfly and Lotus Flower forearm tattoo", style: ['floral', 'symbolic'] },
  { src: tattoo13, alt: "Nose stud piercing", style: ['piercing'] },
  { src: tattoo14, alt: "Butterfly and Lotus Flower forearm tattoo", style: ['floral', 'symbolic'] },
  { src: tattoo15, alt: "Floral vine hip tattoo", style: ['floral'] },
  { src: tattoo16, alt: "Atom and physics equation rib tattoo", style: ['symbolic'] },
];

const styleFilters: { value: TattooStyle; label: string }[] = [
  { value: 'all', label: 'All Styles' },
  { value: 'tribal', label: 'Tribal' },
  { value: 'floral', label: 'Floral' },
  { value: 'realism', label: 'Realism' },
  { value: 'symbolic', label: 'Symbolic' },
  { value: 'script', label: 'Script' },
  { value: 'piercing', label: 'Piercings' },
];

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState<TattooStyle>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const filteredItems = activeFilter === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.style.includes(activeFilter));

  return (
    <div className="min-h-screen bg-background relative">
      <Suspense fallback={null}>
        <Scene3DBroad />
      </Suspense>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="container max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">
              <span className="text-gradient-gold">Portfolio</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of custom tattoo work. Each piece tells a unique story.
            </p>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="py-8 px-4 sticky top-16 z-20 bg-background/80 backdrop-blur-xl border-b border-primary/10">
          <div className="container max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              {styleFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={activeFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.value)}
                  className={activeFilter === filter.value
                    ? "bg-primary text-primary-foreground"
                    : "border-primary/40 hover:border-primary hover:bg-primary/10"
                  }
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-16 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {filteredItems.map((item, index) => (
                <div
                  key={index}
                  className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer glass-panel-elevated"
                  onClick={() => setSelectedImage(item)}
                >
                  <OptimizedImage
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-sm text-foreground font-medium">{item.alt}</p>
                      <div className="flex gap-2 mt-2">
                        {item.style.map((s) => (
                          <span key={s} className="text-xs text-primary capitalize">
                            #{s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No tattoos found for this style.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="container max-w-4xl mx-auto text-center">
            <div className="glass-panel-elevated rounded-[32px] p-12">
              <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-4">
                Ready to Create Your <span className="text-primary">Masterpiece</span>?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Book a consultation to discuss your vision with our artists.
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                onClick={() => window.location.href = '/contact'}
              >
                Book Consultation
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[90vh] w-full">
            <OptimizedImage
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full h-full object-contain rounded-2xl"
            />
            <div className="text-center mt-4">
              <p className="text-foreground font-medium">{selectedImage.alt}</p>
              <div className="flex justify-center gap-2 mt-2">
                {selectedImage.style.map((s) => (
                  <span key={s} className="text-sm text-primary capitalize">
                    #{s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
