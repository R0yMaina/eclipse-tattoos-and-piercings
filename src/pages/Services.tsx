import { lazy, Suspense } from 'react';
import { usePageSeo, SITE_URL } from '@/hooks/usePageSeo';
import { ServicesHero } from '@/components/services/ServicesHero';
import { StickySubnav } from '@/components/services/StickySubnav';
import { TattooServices } from '@/components/services/TattooServices';
import { JewelryAftercare } from '@/components/services/JewelryAftercare';
import { ProcessTimeline } from '@/components/services/ProcessTimeline';
import { ServicesFAQ } from '@/components/services/ServicesFAQ';
import { ServicesCTA } from '@/components/services/ServicesCTA';


const Scene3DBroad = lazy(() => import('@/components/home/Scene3DBroad'));

const Services = () => {
  usePageSeo({
    title: 'Tattoo & Piercing Services | Eclipse Tattoo & Piercings',
    description:
      'Custom tattoos, cover-ups, fine line work and professional piercings in Nairobi, with sterile technique, aftercare guidance and expert artists.',
    path: '/services',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: 'Custom Tattooing',
        provider: { '@type': 'TattooParlor', name: 'Eclipse Tattoo & Piercings', url: SITE_URL },
        areaServed: 'Nairobi, Kenya',
        url: `${SITE_URL}/services`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: 'Body Piercing',
        provider: { '@type': 'TattooParlor', name: 'Eclipse Tattoo & Piercings', url: SITE_URL },
        areaServed: 'Nairobi, Kenya',
        url: `${SITE_URL}/services`,
      },
    ],
  });

  return (
    <div className="min-h-screen bg-background relative">
      <Suspense fallback={null}>
        <Scene3DBroad />
      </Suspense>
      <div className="relative z-10">
        <ServicesHero />
        <StickySubnav />
        <TattooServices />
        <JewelryAftercare />
        
        <ProcessTimeline />
        <ServicesFAQ />
        <ServicesCTA />
      </div>
    </div>
  );
};

export default Services;
