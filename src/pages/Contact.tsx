import { useEffect } from 'react';
import { ContactHero } from '@/components/contact/ContactHero';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactDetails } from '@/components/contact/ContactDetails';
import { MapSection } from '@/components/contact/MapSection';
import { FAQ } from '@/components/contact/FAQ';
import { CTAFooter } from '@/components/contact/CTAFooter';

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
      "telephone": "+1-555-555-0142",
      "email": "bookings@eclipse-ink.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Eclipse Boulevard",
        "addressLocality": "Los Angeles",
        "addressRegion": "CA",
        "postalCode": "90028",
        "addressCountry": "US"
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
    <div className="min-h-screen">
      <ContactHero />
      
      <section className="py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form - Takes 3 columns */}
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
            
            {/* Details - Takes 2 columns */}
            <div className="lg:col-span-2">
              <ContactDetails />
            </div>
          </div>
        </div>
      </section>

      <MapSection />
      <FAQ />
      <CTAFooter />
    </div>
  );
};

export default Contact;
