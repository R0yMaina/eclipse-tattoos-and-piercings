import { useEffect } from 'react';
import { AboutHero } from '@/components/about/AboutHero';
import { StoryValues } from '@/components/about/StoryValues';
import { HygieneEthos } from '@/components/about/HygieneEthos';
import { ArtistsGrid } from '@/components/about/ArtistsGrid';
import { ProcessTimeline } from '@/components/about/ProcessTimeline';
import { AwardsPress } from '@/components/about/AwardsPress';
import { Testimonials } from '@/components/about/Testimonials';
import { StudioGallery } from '@/components/about/StudioGallery';
import { CTASection } from '@/components/about/CTASection';

const About = () => {
  useEffect(() => {
    document.title = 'About | Eclipse Tattoo & Piercings';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Inside Eclipse: our story, values, hygiene standards, artists, and process. A luxury tattoo and piercing studio committed to craft and care.'
      );
    }

    // Add JSON-LD structured data
    const aboutPageScript = document.createElement('script');
    aboutPageScript.type = 'application/ld+json';
    aboutPageScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About Eclipse Tattoo & Piercings",
      "url": "https://eclipse-tattoo-and-piercings.lovable.app/about",
      "description": "Inside Eclipse: our story, values, hygiene standards, artists, and process."
    });

    const organizationScript = document.createElement('script');
    organizationScript.type = 'application/ld+json';
    organizationScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "TattooParlor",
      "name": "Eclipse Tattoo & Piercings",
      "url": "https://eclipse-tattoo-and-piercings.lovable.app",
      "foundingDate": "2017",
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
      "sameAs": [
        "https://instagram.com/eclipsetattoo",
        "https://facebook.com/eclipsetattoo"
      ]
    });

    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://eclipse-tattoo-and-piercings.lovable.app"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "About",
          "item": "https://eclipse-tattoo-and-piercings.lovable.app/about"
        }
      ]
    });

    document.head.appendChild(aboutPageScript);
    document.head.appendChild(organizationScript);
    document.head.appendChild(breadcrumbScript);

    return () => {
      document.head.removeChild(aboutPageScript);
      document.head.removeChild(organizationScript);
      document.head.removeChild(breadcrumbScript);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <AboutHero />
      <StoryValues />
      <HygieneEthos />
      <ArtistsGrid />
      <ProcessTimeline />
      <AwardsPress />
      <Testimonials />
      <StudioGallery />
      <CTASection />
    </div>
  );
};

export default About;
