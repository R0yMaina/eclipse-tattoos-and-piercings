import { Phone, Mail, Clock, MapPin, Instagram } from 'lucide-react';

export const ContactDetails = () => {
  return (
    <div className="space-y-6">
      <div className="glass-panel glass-highlight rounded-[28px] p-8">
        <h3 className="text-2xl font-heading font-semibold mb-6">Studio Details</h3>
        
        <div className="space-y-6">
          {/* Phone */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Phone</p>
              <a 
                href="tel:+254758366452" 
                className="text-foreground hover:text-primary transition-smooth font-medium"
              >
                +254 758 366 452
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <a 
                href="mailto:jamingtonbuluma17@gmail.com" 
                className="text-foreground hover:text-primary transition-smooth font-medium break-all"
              >
                jamingtonbuluma17@gmail.com
              </a>
            </div>
          </div>

          {/* Hours */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">Hours</p>
              <div className="space-y-1 text-foreground">
                <p className="text-sm">Mon–Thu: 11:00–19:00</p>
                <p className="text-sm">Fri–Sat: 11:00–21:00</p>
                <p className="text-sm">Sun: 12:00–18:00</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Location</p>
              <p className="text-foreground font-medium">
                THE BAZAAR<br />
                Floor M4, Suite 6, Room 6<br />
                Nairobi, Kenya
              </p>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Instagram className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">Follow Us</p>
              <div className="space-y-1">
                <a 
                  href="https://www.tiktok.com/@eclipsetattoosnpiercing" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-smooth font-medium flex items-center gap-2"
                >
                  <span className="text-xs">TikTok:</span>
                  <span className="text-sm">@eclipsetattoosnpiercing</span>
                </a>
                <a 
                  href="https://www.instagram.com/eclipse__tattoos" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-smooth font-medium flex items-center gap-2"
                >
                  <span className="text-xs">Instagram:</span>
                  <span className="text-sm">@eclipse__tattoos</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="glass-panel rounded-[20px] p-6">
        <h4 className="font-heading font-semibold mb-3">Walk-ins Welcome</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Subject to artist availability. Appointments recommended for custom work to ensure dedicated time with your preferred artist.
        </p>
      </div>
    </div>
  );
};
