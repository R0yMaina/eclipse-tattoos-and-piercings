import { useEffect, lazy, Suspense } from 'react';
import { ContactHero } from '@/components/contact/ContactHero';
import { BookingSystem } from '@/components/booking/BookingSystem';
import { ContactDetails } from '@/components/contact/ContactDetails';
import { MapSection } from '@/components/contact/MapSection';
import { FAQ } from '@/components/contact/FAQ';
import { CTAFooter } from '@/components/contact/CTAFooter';

const Scene3DBroad = lazy(() => import('@/components/home/Scene3DBroad'));

const Contact = () => {
  useEffect(() => {
    // Update page title and meta description
    document.title = 'Contact | Eclipse Tattoo & Piercings';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Book your tattoo or piercing at Eclipse. Contact us to plan your next piece—precision, artistry, and a premium studio experience.'
      );
    }

    // Add JSON-LD structured data for local business
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "TattooParlor",
      "name": "Eclipse Tattoo & Piercings",
      "url": "https://eclipse-tattoo-and-piercings.lovable.app/contact",
      "telephone": "+254705025961",
      "email": "jamingtonbuluma17@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "THE BAZAAR, Floor M4, Suite 6, Room 6",
        "addressLocality": "Nairobi",
        "addressRegion": "Nairobi",
        "postalCode": "",
        "addressCountry": "KE"
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"],
          "opens": "11:00",
          "closes": "19:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Friday", "Saturday"],
          "opens": "11:00",
          "closes": "21:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Sunday",
          "opens": "12:00",
          "closes": "18:00"
        }
      ],
      "priceRange": "$$",
      "description": "Premium tattoo and piercing studio offering custom artwork, expert piercings, and a luxury experience."
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen relative">
      <Suspense fallback={null}>
        <Scene3DBroad />
      </Suspense>
      <div className="relative z-10">
        <ContactHero />

        <section className="py-16">
          <div className="container max-w-7xl mx-auto px-4">
            {/* Booking System Section */}
            <div className="mb-16">
              <BookingSystem />
            </div>

            <div className="my-12 h-px bg-border/50" />

            {/* Contact Details Section */}
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <h2 className="text-3xl font-heading font-bold">Get In Touch</h2>
                <p className="text-muted-foreground text-lg">
                  Have questions? We're here to help. Reach out to us directly or visit our studio.
                </p>
                <ContactDetails />
              </div>
              {/* Simplified Contact Form for general inquiries if needed, or we can just leave ContactDetails. 
                   The user said merge them. Having Booking + Details is good. 
                   If the user wants a general contact form, I should probably keep it but renaming it 'General Inquiries'.
                   For now, the BookingSystem is the main focus. I will re-add ContactForm as a secondary option "Send a Message" side-by-side with details?
                   Let's just keep ContactDetails and maybe the Map is enough. 
                   Wait, ContactDetails handles listing address/phone. 
                   I will just display ContactDetails.
               */}
            </div>
          </div>
        </section>

        <MapSection />
        <FAQ />
        <CTAFooter />
      </div>
    </div>
  );
};

export default Contact;
