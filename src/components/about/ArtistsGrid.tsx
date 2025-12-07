import { artists } from '@/data/artists';
import { Button } from '@/components/ui/button';
import { Calendar, Instagram } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import novaImg from '@/assets/artists/nova.jpg';
import orionImg from '@/assets/artists/orion.jpg';
import vegaImg from '@/assets/artists/vega.jpg';

const artistImages: Record<string, string> = {
  nova: novaImg,
  orion: orionImg,
  vega: vegaImg
};

export const ArtistsGrid = () => {
  return (
    <section id="artists" className="py-12 md:py-16">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold mb-3">
            Meet the Artists
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            A curated team with distinct styles—united by the Eclipse standard of craft and care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {artists.map((artist, index) => (
            <div 
              key={index}
              className="glass-panel glass-highlight rounded-[20px] md:rounded-[28px] p-4 md:p-6 transition-smooth hover:scale-[1.02] group"
            >
              {/* Headshot */}
              <div className="relative mb-4 md:mb-6 overflow-hidden rounded-[16px] md:rounded-[20px]">
                <OptimizedImage 
                  src={artistImages[artist.headshot]}
                  alt={`${artist.name} - ${artist.role}`}
                  aspectRatio="square"
                  className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                  containerClassName="w-full"
                />
                <div className="absolute inset-0 border border-primary/20 rounded-[16px] md:rounded-[20px] group-hover:border-primary/40 transition-smooth" />
                
                {/* Availability Badge */}
                <div className="absolute top-3 right-3 md:top-4 md:right-4">
                  <span className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold ${
                    artist.availability === 'Books open' 
                      ? 'bg-success/20 text-success border border-success/30' 
                      : 'bg-warning/20 text-warning border border-warning/30'
                  }`}>
                    {artist.availability}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3 md:space-y-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-heading font-semibold mb-1">{artist.name}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{artist.pronouns} • {artist.role}</p>
                </div>

                {/* Styles */}
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {artist.styles.map((style, idx) => (
                    <span 
                      key={idx}
                      className="px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-border text-[10px] md:text-xs text-muted-foreground"
                    >
                      {style}
                    </span>
                  ))}
                </div>

                {/* Experience */}
                <p className="text-xs md:text-sm text-muted-foreground">
                  {artist.experienceYears} years of experience
                </p>

                {/* CTAs */}
                <div className="flex gap-2 md:gap-3 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-smooth text-xs md:text-sm"
                    onClick={() => window.location.href = '/contact'}
                  >
                    <Calendar className="mr-1 md:mr-1.5 h-3.5 w-3.5 md:h-4 md:w-4" />
                    Book
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border hover:border-primary transition-smooth rounded-full"
                    asChild
                  >
                    <a href={artist.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
