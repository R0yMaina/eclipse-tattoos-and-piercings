import { lazy, Suspense } from 'react';
import { usePageSeo, SITE_URL } from '@/hooks/usePageSeo';
import { PricingHero } from '@/components/pricing/PricingHero';
import { PricingStickyNav } from '@/components/pricing/PricingStickyNav';
import { TattooPricing } from '@/components/pricing/TattooPricing';
import { PiercingFees } from '@/components/pricing/PiercingFees';
import { PackagesSection } from '@/components/pricing/PackagesSection';
import { PoliciesSection } from '@/components/pricing/PoliciesSection';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { PricingCTA } from '@/components/pricing/PricingCTA';

const Scene3DBroad = lazy(() => import('@/components/home/Scene3DBroad'));

const Pricing = () => {
  usePageSeo({
    title: 'Pricing & Packages | Eclipse Tattoo & Piercings',
    description:
      'Transparent tattoo and piercing pricing in KES, package options, deposit and cancellation policies for our Nairobi studio.',
    path: '/pricing',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Tattoo & Piercing Pricing',
        url: `${SITE_URL}/pricing`,
        description: 'Service-based tattoo pricing and fixed piercing fees in Kenyan Shillings.',
      },
    ],
  });

  return (
    <div className="min-h-screen bg-background relative">
      <Suspense fallback={null}>
        <Scene3DBroad />
      </Suspense>
      <div className="relative z-10">
        <PricingHero />
        <PricingStickyNav />
        <TattooPricing />
        <PiercingFees />
        <PackagesSection />

        <PoliciesSection />
        <PricingFAQ />
        <PricingCTA />
      </div>
    </div>
  );
};

export default Pricing;
