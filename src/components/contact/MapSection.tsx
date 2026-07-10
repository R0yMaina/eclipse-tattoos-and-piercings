import { MapPin, ExternalLink } from 'lucide-react';

// Eclipse Tattoo & Piercings location - The Bazaar House, Nairobi
const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const SHOP_LOCATION = {
  lat: -1.2864,
  lng: 36.8172,
  address: "The Bazaar House, Suite M4",
  city: "Nairobi, Kenya",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The+Bazaar+Nairobi+Kenya",
  embedUrl: BROWSER_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${BROWSER_KEY}&q=${encodeURIComponent('The Bazaar, Moi Avenue, Nairobi, Kenya')}&zoom=17`
    : `https://maps.google.com/maps?q=${encodeURIComponent('The Bazaar Nairobi Kenya')}&z=17&output=embed`,
};

export const MapSection = () => {
  const handleMapClick = () => {
    window.open(SHOP_LOCATION.googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="py-16">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="glass-panel glass-highlight rounded-[28px] overflow-hidden">
          {/* Interactive Map */}
          <div 
            className="relative h-[400px] md:h-[500px] cursor-pointer group"
            onClick={handleMapClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleMapClick()}
            aria-label="Click to open location in Google Maps"
          >
            {/* Google Maps Embed */}
            <iframe
              src={SHOP_LOCATION.embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 pointer-events-none"
              title="Eclipse Tattoo & Piercings Location"
            />
            
            {/* Clickable Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent flex items-end justify-center pb-8 transition-all group-hover:from-background/90">
              <div className="text-center space-y-3 transform transition-transform group-hover:scale-105">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mx-auto gold-glow shadow-lg">
                  <MapPin className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-foreground font-heading text-xl font-semibold mb-1">
                    Eclipse Tattoo & Piercings
                  </p>
                  <p className="text-muted-foreground text-sm mb-3">
                    {SHOP_LOCATION.address}<br />
                    {SHOP_LOCATION.city}
                  </p>
                  <span className="inline-flex items-center gap-2 text-primary hover:text-accent transition-smooth font-medium bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/30">
                    <ExternalLink className="h-4 w-4" />
                    Click to Open in Google Maps
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-4">
          Click anywhere on the map to get directions
        </p>
      </div>
    </section>
  );
};
