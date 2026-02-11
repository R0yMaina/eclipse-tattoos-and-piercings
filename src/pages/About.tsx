import { useEffect, lazy, Suspense } from 'react';
import { AboutHero } from '@/components/about/AboutHero';
import { StoryValues } from '@/components/about/StoryValues';
import { HygieneEthos } from '@/components/about/HygieneEthos';
import { ProcessTimeline } from '@/components/about/ProcessTimeline';
import { AwardsPress } from '@/components/about/AwardsPress';
import { Testimonials } from '@/components/about/Testimonials';
import { InstagramGallery } from '@/components/about/InstagramGallery';
import { CTASection } from '@/components/about/CTASection';

const Scene3DBroad = lazy(() => import('@/components/home/Scene3DBroad'));

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
      "foundingDate": "2019",
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
      "sameAs": [
        "https://www.instagram.com/eclipse__tattoos?igsh=MTRxOXM2Nzk4dmhjZg==",
        "https://www.tiktok.com/@eclipse_tattoos?_r=1&_t=ZM-91I3dITpdDH"
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
    <div className="min-h-screen relative">
      <Suspense fallback={null}>
        <Scene3DBroad />
      </Suspense>
      <div className="relative z-10">
        <AboutHero />
        <StoryValues />
        <HygieneEthos />
        <InstagramGallery />
        <ProcessTimeline />
        <AwardsPress />
        <Testimonials />
        <CTASection />
      </div>
    </div>
  );
};

export default About;
