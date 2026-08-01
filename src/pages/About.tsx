import { lazy, Suspense } from 'react';
import { AboutHero } from '@/components/about/AboutHero';
import { StoryValues } from '@/components/about/StoryValues';
import { HygieneEthos } from '@/components/about/HygieneEthos';
import { ProcessTimeline } from '@/components/about/ProcessTimeline';
import { AwardsPress } from '@/components/about/AwardsPress';
import { Testimonials } from '@/components/about/Testimonials';
import { InstagramGallery } from '@/components/about/InstagramGallery';
import { CTASection } from '@/components/about/CTASection';
import { usePageSeo, SITE_URL } from '@/hooks/usePageSeo';

const Scene3DBroad = lazy(() => import('@/components/home/Scene3DBroad'));

const About = () => {
  usePageSeo({
    title: 'About Our Studio | Eclipse Tattoo & Piercings Nairobi',
    description:
      'Inside Eclipse: our story, values, hygiene standards, artists, and process. A luxury tattoo and piercing studio in Nairobi committed to craft and care.',
    path: '/about',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About Eclipse Tattoo & Piercings',
        url: `${SITE_URL}/about`,
        description: 'Inside Eclipse: our story, values, hygiene standards, artists, and process.',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'TattooParlor',
        name: 'Eclipse Tattoo & Piercings',
        url: SITE_URL,
        foundingDate: '2019',
        telephone: '+254705025961',
        email: 'jamingtonbuluma17@gmail.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'THE BAZAAR, Floor M4, Suite 6, Room 6',
          addressLocality: 'Nairobi',
          addressRegion: 'Nairobi',
          addressCountry: 'KE',
        },
        sameAs: [
          'https://www.instagram.com/eclipse__tattoos?igsh=MTRxOXM2Nzk4dmhjZg==',
          'https://www.tiktok.com/@eclipse_tattoos?_r=1&_t=ZM-91I3dITpdDH',
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_URL}/about` },
        ],
      },
    ],
  });

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
