import { artists } from '@/data/artists';
import { Button } from '@/components/ui/button';
import { Calendar, Instagram } from 'lucide-react';
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
    <section id="artists" className="py-16">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-3">
            Meet the Artists
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A curated team with distinct styles—united by the Eclipse standard of craft and care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist, index) => (
            <div 
              key={index}
              className="glass-panel glass-highlight rounded-[28px] p-6 transition-smooth hover:scale-[1.02] group"
            >
              {/* Headshot */}
              <div className="relative mb-6 overflow-hidden rounded-[20px]">
                <div className="aspect-square relative">
                  <img 
                    src={artistImages[artist.headshot]}
                    alt={`${artist.name} - ${artist.role}`}
                    className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                  />
                  <div className="absolute inset-0 border border-primary/20 rounded-[20px] group-hover:border-primary/40 transition-smooth" />
                </div>
                
                {/* Availability Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    artist.availability === 'Books open' 
                      ? 'bg-success/20 text-success border border-success/30' 
                      : 'bg-warning/20 text-warning border border-warning/30'
                  }`}>
                    {artist.availability}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-heading font-semibold mb-1">{artist.name}</h3>
                  <p className="text-sm text-muted-foreground">{artist.pronouns} • {artist.role}</p>
                </div>

                {/* Styles */}
                <div className="flex flex-wrap gap-2">
                  {artist.styles.map((style, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-full border border-border text-xs text-muted-foreground"
                    >
                      {style}
                    </span>
                  ))}
                </div>

                {/* Experience */}
                <p className="text-sm text-muted-foreground">
                  {artist.experienceYears} years of experience
                </p>

                {/* CTAs */}
                <div className="flex gap-3 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-smooth"
                    onClick={() => window.location.href = '/contact'}
                  >
                    <Calendar className="mr-1.5 h-4 w-4" />
                    Book
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border hover:border-primary transition-smooth rounded-full"
                    asChild
                  >
                    <a href={artist.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-4 w-4" />
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
